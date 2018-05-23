(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['nacl'],
      __esModule: true,
    };
  }

  define('tweetnacl', [], vendorModule);
})();
