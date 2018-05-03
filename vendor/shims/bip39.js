(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['bip39'],
      __esModule: true,
    };
  }

  define('bip39', [], vendorModule);
})();
