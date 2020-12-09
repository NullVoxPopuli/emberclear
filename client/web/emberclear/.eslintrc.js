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
      // parserOptions: {
      //   ...base.parserOptions,
      //   tsconfigRootDir: __dirname,
      //   project: ['./tsconfig.json'],
      // },
      // extends: [
      //   ...typescript.extends,
      //   'plugin:@typescript-eslint/recommended-requiring-type-checking',
      // ],
      rules: {
        ...typescript.rules,
        'no-undef': 'off',
      },
    },
    {
      ...appOverrides,
      // parserOptions: {
      //   ...base.parserOptions,
      //   tsconfigRootDir: __dirname,
      //   project: ['./tsconfig.json'],
      // },
    },
    testOverrides,
    nodeOverrides,
  ],
};
