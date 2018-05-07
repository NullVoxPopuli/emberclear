'use strict';

const Funnel = require('broccoli-funnel');
const mergeTrees = require('broccoli-merge-trees');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // phoenix sockets!
  app.import('node_modules/phoenix/assets/js/phoenix.js',  {
    using: [
      { transformation: 'cjs', as: 'phoenix'}
    ]
  });

  // font awesome
  app.import('vendor/fontawesome/css/font-awesome-all.min.css');
  var fontTree = new Funnel('vendor/fontawesome/webfonts', { destDir: '/assets/fontawesome/webfonts' });
  var fontStyleTree = new Funnel('vendor/fontawesome/css', { destDir: '/assets/fontawesome/css' });


  // libsodium
  app.import('node_modules/libsodium/dist/modules/libsodium.js');
  app.import('node_modules/libsodium-wrappers/dist/modules/libsodium-wrappers.js');
  app.import('vendor/shims/libsodium.js');
  app.import('vendor/shims/libsodium-wrappers.js');

  // bip39
  // app.import('node_modules/string_decoder/index.js', { using: [{ transformation: 'cjs', as: 'string_decoder' }]});
  // app.import('node_modules/emitter/dist/emitter.js', { using: [{ transformation: 'cjs', as: 'emitter' }]});
  // app.import('node_modules/stream/index.js', { using: [{ transformation: 'cjs', as: 'stream' }]});
  // app.import('node_modules/buffer/index.js', { using: [{ transformation: 'cjs', as: 'buffer' }]});
  app.import('node_modules/bip39/index.js',  { using: [{ transformation: 'cjs', as: 'bip39'}]});
  // app.import('node_modules/bip39/index.js');
  // app.import('vendor/shims/bip39.js');

  // qrcode
  app.import('node_modules/qrcode/build/qrcode.min.js');
  app.import('vendor/shims/qrcode.js');

  // text-encoding
  // app.import('node_modules/text-encoding/index.js', {
  //   using: [
  //     { transformation: 'cjs', as: 'text-encoding'}
  //   ]
  // });

  return mergeTrees([app.toTree(), fontTree, fontStyleTree]);
};
