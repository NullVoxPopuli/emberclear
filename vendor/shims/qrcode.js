(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['qrcode'],
      __esModule: true,
    };
  }

  define('qrcode', [], vendorModule);
})();
