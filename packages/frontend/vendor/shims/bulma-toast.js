(function() {
  function vendorModule() {
    'use strict';

    return self['bulmaToast'];
  }

  define('bulma-toast', [], vendorModule);
})();
