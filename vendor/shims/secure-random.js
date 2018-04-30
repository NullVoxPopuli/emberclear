(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['secure-random'],
      __esModule: true,
    };
  }

  define('secure-random', [], vendorModule);
})();
