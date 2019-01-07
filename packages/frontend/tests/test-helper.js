import Application from '../src/main';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';

import {
  hasWASM,
  hasCamera,
  hasIndexedDb,
  hasNotifications,
  hasWebWorker,
} from 'emberclear/src/ui/routes/index/-components/compatibility/-utils/detection';

const seed = Math.random()
  .toString(36)
  .substr(2, 5);

// const seed = 'y1mh0';

QUnit.config.seed = seed;
QUnit.config.reorder = true;
QUnit.begin(async () => {
  console.info(`Using seed for Qunit: ${seed}`);

  console.info(`

    ------------------------ Compatibility ------------------------

    --- The test environment must support all of these features ---

    IndexedDb: ${await hasIndexedDb()}
    Camera: ${await hasCamera()}
    WASM: ${await hasWASM()}
    Notifications: ${hasNotifications()}
    ServiceWorker: not tested
    WebWorker: ${hasWebWorker()}
  `);
});

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
