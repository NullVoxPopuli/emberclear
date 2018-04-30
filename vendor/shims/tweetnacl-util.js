(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['tweetnacl-util'],
      __esModule: true,
    };
  }

  define('tweetnacl-util', [], vendorModule);
})();
