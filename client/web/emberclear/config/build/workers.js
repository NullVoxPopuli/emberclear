const Rollup = require('broccoli-rollup');

const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const filesize = require('rollup-plugin-filesize');

const AssetRev = require('broccoli-asset-rev');

const colors = require('colors');

const path = require('path');
const fs = require('fs');

let cwd = process.cwd();
let workerRoot = path.join(cwd, 'app', 'workers');
let extensions = ['.js', '.ts'];

let babelConfig = {
  extensions,
  babelrc: false,
  presets: [
    [
      require('@babel/preset-env'),
      {
        useBuiltIns: 'usage',
        targets: '> 2%, not IE 11, not dead',
        corejs: {
          version: 3,
        },
      },
    ],
    require('@babel/preset-typescript'),
  ],
  plugins: [
    require('@babel/plugin-proposal-class-properties'),
    require('@babel/plugin-proposal-object-rest-spread'),
  ],
  exclude: /node_modules/,
};

function detectWorkers() {
  let workers = {};
  let dir = fs.readdirSync(workerRoot);

  for (let i = 0; i < dir.length; i++) {
    let name = dir[i];
    workers[name] = path.join(workerRoot, name, 'index.ts');
  }

  return workers;
}

function configureWorkerTree({ isProduction, hash, CONCAT_STATS }) {
  return ([name, entryPath]) => {
    let workerDir = path.join(workerRoot, name);

    let rollupTree = new Rollup(workerDir, {
      rollup: {
        input: entryPath,
        output: [
          {
            file: `workers/${name}.js`,
            format: 'esm',
          },
        ],
        plugins: [
          ...(CONCAT_STATS
            ? [
                require('rollup-plugin-visualizer')({
                  gzipSize: true,
                  brotliSize: true,
                  // json: true,
                  filename: `bundle/${name}.html`,
                }),
              ]
            : []),
          resolve({
            extensions,
            browser: true,
            preferBuiltins: false,
          }),
          commonjs({
            include: ['node_modules/**'],
            namedExports: {
              tweetnacl: ['nacl'],
            },
          }),
          babel(babelConfig),
          ...(isProduction ? [terser()] : []),
          filesize({ render: printSizes }),
        ],
      },
    });

    if (!isProduction) {
      return rollupTree;
    }

    return new AssetRev(rollupTree, {
      customHash: hash,
    });
  };
}

module.exports = {
  buildWorkerTrees(env) {
    let inputs = detectWorkers();
    let workerBuilder = configureWorkerTree(env);
    let workerTrees = Object.entries(inputs).map(workerBuilder);

    return workerTrees;
  },
};

function printSizes(opt, outputOptions, info) {
  let primaryColor = opt.theme === 'dark' ? 'green' : 'black';
  let secondaryColor = opt.theme === 'dark' ? 'yellow' : 'blue';

  let title = colors[primaryColor].bold;
  let value = colors[secondaryColor];

  let file = outputOptions.file.replace(cwd, '');

  let values = [
    '\n',
    'Built Web Worker:',
    `${title('Destination: ')}${value(file)}`,
    `${title('Bundle Size: ')} ${value(info.bundleSize)}`,
    `${title('Minified Size: ')} ${value(info.minSize)}`,
    `${title('Gzipped Size: ')} ${value(info.gzipSize)}`,
  ];

  return values.join('\n');
}
