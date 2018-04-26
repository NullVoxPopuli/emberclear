(function() {
  function vendorModule() {
    'use strict';

    return self['phoenix-socket'];
  }

  define('phoenix-socket', [], vendorModule);
})();
