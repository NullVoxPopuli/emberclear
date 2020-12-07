'use strict';

const path = require('path');
const fs = require('fs');

const esbuild = require('esbuild');

let cwd = process.cwd();
let workerRoot = path.join(cwd, 'app', 'workers');

function detectWorkers() {
  let workers = {};
  let dir = fs.readdirSync(workerRoot);

  for (let i = 0; i < dir.length; i++) {
    let name = dir[i];
    workers[name] = path.join(workerRoot, name, 'index.ts');
  }

  return workers;
}

function configureWorkerTree({ isProduction, hash }) {
  return ([name, entryPath]) => {
    // let workerDir = path.join(workerRoot, name);
    let appDir = path.join(__dirname, '..', '..');
    // let rootNodeModules = path.join(appDir, '..', 'node_modules', '**');

    esbuild.buildSync({
      loader: { '.ts': 'ts' },
      entryPoints: [entryPath],
      bundle: true,
      outfile: path.join(appDir, 'public', 'workers', `${name}-${hash}.js`),
      format: 'esm',
      minify: isProduction,
      sourcemap: !isProduction,
      // incremental: true,
      tsconfig: path.join(appDir, 'tsconfig.json'),
    });
  };
}

module.exports = {
  buildWorkerTrees(env) {
    let inputs = detectWorkers();
    let workerBuilder = configureWorkerTree(env);

    // separate build from ember, will be detached, won't watch
    Object.entries(inputs).map(workerBuilder);

    return [];
  },
};
