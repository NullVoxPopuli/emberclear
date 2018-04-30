(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['nacl-fast.min'],
      __esModule: true,
    };
  }

  define('tweetnacl', [], vendorModule);
})();
