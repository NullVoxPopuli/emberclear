import Application from '../src/main';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';

const seed = Math.random()
  .toString(36)
  .substr(2, 5);

// const seed = 'y1mh0';

QUnit.config.seed = seed;
QUnit.config.reorder = true;
QUnit.begin(() => console.info(`Using seed for Qunit: ${seed}`));

QUnit.assert.contains = function(source, sub, message) {
  let trimmedSource = source.trim();
  this.pushResult({
    result: trimmedSource.includes(sub),
    actual: trimmedSource,
    expected: sub,
    message: message || `expected ${trimmedSource} to contain ${sub}`,
  });
};

setApplication(Application.create(config.APP));

start({
  setupTestIsolationValidation: true,
});
