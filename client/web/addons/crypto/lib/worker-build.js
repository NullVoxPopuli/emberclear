'use strict';

const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const addonFolder = path.join(__dirname, '..', 'addon');
const workerRoot = path.join(addonFolder, 'workers');

function detectWorkers() {
  let workers = {};
  let dir = fs.readdirSync(workerRoot);

  for (let i = 0; i < dir.length; i++) {
    let name = dir[i];

    workers[name] = path.join(workerRoot, name, 'index.ts');
  }

  return workers;
}

function configureWorkerTree({ isProduction, buildDir }) {
  return ([name, entryPath]) => {
    esbuild.buildSync({
      loader: { '.ts': 'ts' },
      entryPoints: [entryPath],
      bundle: true,
      outfile: path.join(buildDir, `${name}.js`),
      format: 'esm',
      minify: isProduction,
      sourcemap: !isProduction,
      // incremental: true,
      tsconfig: path.join(addonFolder, 'tsconfig.json'),
    });
  };
}

function buildWorkers(env) {
  let inputs = detectWorkers();
  let workerBuilder = configureWorkerTree(env);

  // separate build from ember, will be detached, won't watch
  Object.entries(inputs).map(workerBuilder);
}

module.exports = { buildWorkers };
