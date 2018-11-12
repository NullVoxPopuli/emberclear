module.exports = {
  env: {
    embertest: true
  },
  rules: {
    // doesn't support deep nesting
    'qunit/no-identical-names': 'warn'
  },
};
