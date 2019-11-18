'use strict';

module.exports = {
  presets: [
    [require('babel-preset-latest-node'), { target: 'current' }],
    // require('@babel/preset-env'),
    // require('@babel/preset-typescript')
  ],
  plugins: [
    require('@babel/plugin-proposal-class-properties'),
    require('@babel/plugin-proposal-object-rest-spread'),
  ],
};
