'use strict';

const merge = require('deepmerge');

const { base, nodeConfig } = require('@emberclear/config/eslint');

// This configuration doesn't matter.
// Projcets are overwrite with their own config.
module.exports = merge(base, nodeConfig);
