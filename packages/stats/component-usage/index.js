#!/usr/bin/env node
'use strict';

const walk = require('walk');
const fs = require('fs');
const path = require('path');
const cla = require('command-line-args');

const COMPONENT_INVOCATIONS = {};

const optionDefinitions = [
  { name: 'ignore', alias: 'i', type: String, multiple: true },
  { name: 'path', alias: 'p', type: String, multiple: false },
];

let options = cla(optionDefinitions);
let { path: _searchPath, ignore } = options;

let searchPath = path.join(process.cwd(), _searchPath);

console.log('searchPath:', searchPath);

const COMPONENT_REGEX = /<([A-Z][\w:]+)/g;

let deleteMe = 10;

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
        return next();
      }

      let matches = contents.matchAll(COMPONENT_REGEX);

      for (let match of matches) {
        let componentName = match[1];
        let existing = COMPONENT_INVOCATIONS[componentName] || 0;
        COMPONENT_INVOCATIONS[componentName] = existing + 1;

        if (Object.keys(COMPONENT_INVOCATIONS).length === deleteMe) {
          console.log(COMPONENT_INVOCATIONS);
          process.exit(0);
        }

      }

      next();
    },
    errors(root, nodeStats, next) {
      console.log(root, nodeStats);
      next();
    },
    end() {
      console.log(COMPONENT_INVOCATIONS);
      console.log('end');
    }
  }
});

