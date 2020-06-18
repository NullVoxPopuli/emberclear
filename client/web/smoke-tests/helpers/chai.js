const chai = require('chai');
const chaiWebDriver = require('@faltest/chai');

chai.use(chaiWebDriver);
chai.use(require('chai-string'));
chai.use(require('chai-fs'));
chai.use(require('chai-as-promised'));

module.exports = chai;
