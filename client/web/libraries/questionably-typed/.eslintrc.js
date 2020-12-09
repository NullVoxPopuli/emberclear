'use strict';

const { base, simpleTypescript, nodeOverrides } = require('@emberclear/config/eslint');

module.exports = {
  ...base,
  overrides: [
    {
      files: ['*.ts'],
      ...simpleTypescript,
    },
    nodeOverrides,
  ],
};
