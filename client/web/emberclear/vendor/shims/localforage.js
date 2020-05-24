(function() {
  function vendorModule() {
    'use strict';

    return {
      'default': self['localforage'],
      __esModule: true,
    };
  }

  define('localforage', [], vendorModule);
})();
