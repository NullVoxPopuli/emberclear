module.exports = {
  addonConfig: {
    autoImport: {
      alias: {
        qrcode: 'qrcode/build/qrcode.min.js',
        'qr-scanner': 'qr-scanner/qr-scanner.min.js',
        uuid: 'uuid/index.js',
      },
      exclude: [],
    },

    'ember-test-selectors': {
      strip: false, // isProduction,
    },

    eslint: {
      testGenerator: 'qunit',
      group: true,
      rulesDir: 'eslint-rules',
      extensions: ['js', 'ts'],
    },
  },
  serviceWorkerConfig({ version }) {
    return {
      'asset-cache': {
        version,
        include: ['assets/**/*', '**/*.html', 'index.html'],
        exclude: ['.well-known/**/*', 'bundle.html', 'favicon.ico', 'robots.txt'],
      },
      'esw-index': {
        version,
        excludeScope: [/\.well-known/, /bundle.html/, /favicon.ico/, /robots.txt/],
      },
      'esw-cache-fallback': {
        patterns: ['https://(.+)/open_graph?(.+)'],
      },
    };
  },
};
