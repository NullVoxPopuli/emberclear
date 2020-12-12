'use strict';

const baseConfig = {
  plugins: ['json'],
  extends: ['plugin:json/recommended'],
};

const withCommentsConfig = {
  plugins: ['json'],
  extends: ['plugin:json/recommended-with-comments'],
};

const packageJson = {
  ...baseConfig,
  files: ['package.json'],
};

const tsConfig = {
  ...withCommentsConfig,
  files: ['tsconfig.json', 'tsconfig*.json'],
};

module.exports = { baseConfig, withCommentsConfig, json: [packageJson, tsConfig] };
