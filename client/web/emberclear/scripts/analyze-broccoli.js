'use strict';

const path = require('path');
const fs = require('fs');
const { createOutput, summarizeAll } = require('broccoli-concat-analyser');

/**
 * Inspiration / stolen from:
 *   https://github.com/kaliber5/ember-cli-bundle-analyzer/pull/70
 *
 */
async function analyzeBroccoli() {
  let ignoredFiles = [
    'ember.js',
    'ember-testing.js',
    'tests.js',
    'test-support.js',
    'test-support.css',
    '*-test.js',
    '*.out.json',
  ];

  let outputPath = path.join(process.cwd(), 'concat-stats-for');

  process.env.CONCAT_STATS_PATH = outputPath;

  await summarizeAll(outputPath, ignoredFiles);

  let content = createOutput(outputPath);

  fs.writeFileSync(path.join(outputPath, 'index.html'), content);
}

analyzeBroccoli();
