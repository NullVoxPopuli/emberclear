(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['QRCode'],
      __esModule: true,
    };
  }

  define('qrcode', [], vendorModule);
})();
