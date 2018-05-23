(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['nacl'].util,
      __esModule: true,
    };
  }

  define('tweetnacl-util', [], vendorModule);
})();
