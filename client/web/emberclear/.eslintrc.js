const {
  base,
  typescript,
  nodeOverrides,
  testOverrides,
  appOverrides,
} = require('@emberclear/config/eslint');

module.exports = {
  ...base,
  overrides: [
    // weird ones
    {
      files: ['app/services/prism-manager.ts'],
      ...typescript,
      rules: {
        ...typescript.rules,
        'no-undef': 'off',
      },
    },
    {
      ...appOverrides,
      parserOptions: {
        ...base.parserOptions,
        project: require.resolve('./tsconfig.json'),
      },
    },
    testOverrides,
    nodeOverrides,
  ],
};
