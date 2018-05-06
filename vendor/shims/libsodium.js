(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['libsodium'],
      __esModule: true,
    };
  }

  define('libsodium', [], vendorModule);
})();
