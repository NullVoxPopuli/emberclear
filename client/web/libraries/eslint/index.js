'use strict';

const { ember } = require('./configs/ember');
const { node } = require('./configs/node');
const { json } = require('./configs/json');
const { configCreator } = require('./utils');

module.exports = {
  configs: {
    ember: configCreator(ember, json),
    node: configCreator(node, json),
  },
};
