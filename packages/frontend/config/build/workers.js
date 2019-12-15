const Rollup = require('broccoli-rollup');

const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const filesize = require('rollup-plugin-filesize');

const colors = require('colors');

const path = require('path');
const fs = require('fs');

let cwd = process.cwd();
let workerRoot = path.join(cwd, 'app', 'workers');
let outputRoot = path.join(cwd, 'public', 'workers');
let extensions = ['.js', '.ts'];

let babelConfig = {
  extensions,
  babelrc: false,
  presets: [
    [
      require('@babel/preset-env'),
      {
        useBuiltIns: 'usage',
        corejs: 3,
        targets: '> 5%, not IE 11, not dead',
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

function configureWorkerTree({ isProduction }) {
  return ([name, entryPath]) => {
    let workerDir = path.join(workerRoot, name);

    let rollupTree = new Rollup(workerDir, {
      rollup: {
        input: entryPath,
        output: [
          {
            file: path.join(outputRoot, `${name}.js`),
            format: 'esm',
          },
        ],
        plugins: [
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
          filesize({
            render(opt, outputOptions, info) {
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
            },
          }),
        ],
      },
    });

    return rollupTree;
  };
}

module.exports = {
  buildWorkerTrees({ isProduction }) {
    // focus tree -- prevents from watching too many things
    let inputs = detectWorkers();
    let workerBuilder = configureWorkerTree({ isProduction });
    let workerTrees = Object.entries(inputs).map(workerBuilder);

    return workerTrees;
  },
};
