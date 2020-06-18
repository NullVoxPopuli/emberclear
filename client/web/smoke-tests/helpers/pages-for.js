'use strict';

module.exports = {
  pagesFor(PageObject) {
    return this.browsers.map((browser) => {
      return new PageObject(this.host, browser);
    });
  },
};
