(function() {
  function vendorModule() {
    'use strict';

    return {
      default: self,
      __esModule: true,
    };
  }

  define('libsodium-wrappers', [], vendorModule);
})();
