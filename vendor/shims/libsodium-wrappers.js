(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['sodium'],
      __esModule: true,
    };
  }

  define('libsodium-wrappers', [], vendorModule);
})();
