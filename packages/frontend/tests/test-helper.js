import Application from '../app';
import registerWaiter from 'ember-raf-scheduler/test-support/register-waiter';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';
// import { start } from 'ember-qunit';
import QUnit from 'qunit';

// Install Types and assertion extensions
import 'qunit-dom';
import 'qunit-assertions-extra';

import {
  hasWASM,
  hasCamera,
  hasIndexedDb,
  hasNotifications,
  hasWebWorker,
} from 'emberclear/pods/components/pod/index/compatibility/-utils/detection';

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

setApplication(Application.create(config.APP));

registerWaiter();

start({
  setupTestIsolationValidation: true,
});
