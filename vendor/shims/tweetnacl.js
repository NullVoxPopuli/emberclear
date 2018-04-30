(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['tweetnacl'],
      __esModule: true,
    };
  }

  define('tweetnacl', [], vendorModule);
})();
