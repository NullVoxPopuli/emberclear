'use strict';

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

  // app.import('node_modules/bip39/index.js');
  // app.import('vendor/shims/bip39.js');

  // tweetnacl-js
  app.import('node_modules/tweetnacl/nacl-fast.min.js', {
    using: [
      { transformation: 'cjs', as: 'tweetnacl'}
    ]
  });
  app.import('vendor/shims/tweetnacl.js');

  // tweetnacl-util
  app.import('node_modules/tweetnacl-util/nacl-util.js');
  app.import('vendor/shims/tweetnacl-util.js');

  // secure-random
  app.import('node_modules/secure-random/lib/secure-random.js');
  app.import('vendor/shims/secure-random.js');

  // qrcode
  app.import('node_modules/qrcode/build/qrcode.min.js');
  app.import('vendor/shims/qrcode.js');

  // text-encoding
  app.import('node_modules/text-encoding/index.js' ,{
    using: [
      { transformation: 'cjs', as: 'text-encoding'}
    ]
  });

  return app.toTree();
};
