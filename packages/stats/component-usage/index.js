#!/usr/bin/env node
'use strict';

const walk = require('walk');
const fs = require('fs');
const path = require('path');
const cla = require('command-line-args');

const { componentsInContent } = require('./lib/utils');
const { printComponentInvocationStats } = require('./lib/printing');

const { searchAndExtract } = require('extract-tagged-template-literals');

// const { searchAndExtractHbs } = require('ember-extract-inline-templates');

const COMPONENT_INVOCATIONS = {};

const optionDefinitions = [
  { name: 'ignore', alias: 'i', type: String, multiple: true },
  { name: 'path', alias: 'p', type: String, multiple: false },
];

let options = cla(optionDefinitions);
let { path: _searchPath, ignore } = options;

let searchPath = path.join(process.cwd(), _searchPath);

function printStats() {
  printComponentInvocationStats(COMPONENT_INVOCATIONS);
}

walk.walkSync(searchPath, {
  followLinks: true,
  filters: [...( ignore || [] ), 'tests', 'tmp', '.git'],
  listeners: {
    file(root, fileStats, next) {
      let { name } = fileStats;
      let filePath = path.join(root, name);
      let contents = fs.readFileSync(filePath, 'utf8');
      let pathParts = filePath.split('.');
      let ext = pathParts[pathParts.length - 1];

      if (ext !== 'hbs') {
        // let hbs = searchAndExtractHbs(contents);
        let hbs = searchAndExtract(contents, 'hbs');

        contents = hbs;
      }

      let components = componentsInContent(contents);

      for (let componentName of components) {
        let existing = COMPONENT_INVOCATIONS[componentName] || 0;
        COMPONENT_INVOCATIONS[componentName] = existing + 1;
      }

      next();
    },
    errors(root, nodeStats, next) {
      console.log(root, nodeStats);
      next();
    },
    end() {
      printStats();
      console.log('end');
    }
  }
});

