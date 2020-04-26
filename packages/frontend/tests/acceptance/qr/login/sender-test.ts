import { module } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';

// import { Machine } from 'xstate';
// import { createModel } from '@xstate/test';
// import { setupXStateTest, testShortestPaths } from 'qunit-xstate-test';

import { setupWorkers, clearLocalStorage } from 'emberclear/tests/helpers';

module('Acceptance | QR | Login | Sender', function (hooks) {
  setupApplicationTest(hooks);
  clearLocalStorage(hooks);
  setupWorkers(hooks);

  // setupXStateTest(hooks, testModel);

  // testShortestPaths(testModel, (assert, path) => {
  //   // set up for your tests
  //   // ...
  //   // pass `assert` to your meta.test context
  //   return path.t00est({ assert });
  // });
});

// const testModel = createModel(Machine({}));
