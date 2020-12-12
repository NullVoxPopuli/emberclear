import Service from '@ember/service';
import { settled } from '@ember/test-helpers';
import { module } from 'qunit';
import { setupXStateTest } from 'qunit-xstate-test';
import { setupApplicationTest } from 'ember-qunit';

import { createModel } from '@xstate/test';
import { scanQR } from 'ember-jsqr/test-support';
import RSVP from 'rsvp';
import { Machine } from 'xstate';

import NavigatorService from 'emberclear/services/browser/navigator';
import { testShortestPaths } from 'emberclear/tests/-temp/qunit-xstate-test';
import { getService, setupCurrentUser, setupEmberclearTest, visit } from 'emberclear/tests/helpers';
import { page } from 'emberclear/tests/helpers/pages/qr';

import type ApplicationInstance from '@ember/application/instance';
import type { TestContext } from 'ember-test-helpers';

interface TestMachineContext {
  assert: Assert;
  owner: ApplicationInstance;
  t: Intl['t'];
  connection: {
    fakeTransfer: RSVP.Deferred<void>;
    setup: RSVP.Deferred<void>;
    transferToDevice: () => Promise<void>;
  };
}

const testModel = createModel<TestMachineContext, EmptyRecord>(
  Machine({
    id: 'login-test',
    initial: 'begin',
    states: {
      begin: {
        on: {
          SCAN_LOGIN_VALID: 'scannedValidLoginQR',
          SCAN_LOGIN_INVALID: 'begin',
          SCAN_INVALID: 'begin',
        },
        meta: {
          async test({ assert, t }: TestMachineContext) {
            await settled();
            assert.notContains(page.text, t('qrCode.waitingForCamera'));

            assert.equal(page.error.isPresent, false, 'Error Message');
            assert.equal(page.confirm.isPresent, false, 'Confirm Prompt');
            assert.equal(page.unknownState.isPresent, false, 'Unknown Error');
            assert.equal(page.scanner.isPresent, true, 'Scanner');
          },
        },
      },
      scannedValidLoginQR: {
        on: {
          CONNECTION_SUCCESS: 'establishedConnection',
          CONNECTION_FAILURE: 'connectionFailed',
        },
        meta: {
          async test({ assert, t }: TestMachineContext) {
            await settled();
            assert.contains(page.text, t('ui.login.transfer.establishConnection'));

            assert.equal(page.error.isPresent, false, 'Error Message');
            assert.equal(page.confirm.isPresent, false, 'Confirm Prompt');
            assert.equal(page.unknownState.isPresent, false, 'Unknown Error');
            assert.equal(page.scanner.isPresent, false, 'Scanner');
          },
        },
      },
      establishedConnection: {
        on: {
          CLICK_ALLOW: 'transferData',
          CLICK_DENY: 'userDeniedTransfer',
        },
        meta: {
          async test({ assert, t }: TestMachineContext) {
            await settled();
            assert.contains(page.text, t('ui.login.verify.title'));
            assert.contains(page.confirm.code, 'AB12');

            assert.equal(page.error.isPresent, false, 'Error Message');
            assert.equal(page.confirm.isPresent, true, 'Confirm Prompt');
            assert.equal(page.unknownState.isPresent, false, 'Unknown Error');
            assert.equal(page.scanner.isPresent, false, 'Scanner');
          },
        },
      },
      connectionFailed: {
        meta: {
          async test({ assert }: TestMachineContext) {
            await settled();

            assert.equal(page.error.isPresent, true, 'Error Message');
            assert.equal(page.confirm.isPresent, false, 'Confirm Prompt');
            assert.equal(page.unknownState.isPresent, false, 'Unknown Error');
            assert.equal(page.scanner.isPresent, false, 'Scanner');
          },
        },
      },
      transferData: {
        on: {
          TRANSFER_SUCCESS: 'transferSuccessful',
          TRANSFER_FAILED: 'transferFailed',
        },
        meta: {
          async test({ assert, t }: TestMachineContext) {
            assert.contains(page.text, t('ui.login.transfer.inProgress'));
          },
        },
      },
      userDeniedTransfer: {
        meta: {
          async test({ assert }: TestMachineContext) {
            await settled();

            assert.equal(page.error.isPresent, true, 'Error Message');
            assert.equal(page.confirm.isPresent, false, 'Confirm Prompt');
            assert.equal(page.unknownState.isPresent, false, 'Unknown Error');
            assert.equal(page.scanner.isPresent, false, 'Scanner');
          },
        },
      },
      transferSuccessful: {
        meta: {
          async test({ assert, t }: TestMachineContext) {
            await settled();

            assert.contains(page.text, t('ui.login.transfer.success'));

            assert.equal(page.error.isPresent, false, 'Error Message');
            assert.equal(page.confirm.isPresent, false, 'Confirm Prompt');
            assert.equal(page.unknownState.isPresent, false, 'Unknown Error');
            assert.equal(page.scanner.isPresent, false, 'Scanner');
          },
        },
      },
      transferFailed: {
        meta: {
          async test({ assert }: TestMachineContext) {
            await settled();

            assert.equal(page.error.isPresent, true, 'Error Message');
            assert.equal(page.confirm.isPresent, false, 'Confirm Prompt');
            assert.equal(page.unknownState.isPresent, false, 'Unknown Error');
            assert.equal(page.scanner.isPresent, false, 'Scanner');
          },
        },
      },
    },
  })
).withEvents({
  ////////////////////////////////////////////////////
  // SCANNING
  SCAN_LOGIN_VALID: {
    async exec({ owner }) {
      await scanQR(owner, ['login', { pub: 'abcdef123', verify: 'AB12' }]);
    },
  },
  SCAN_LOGIN_INVALID: {
    async exec({ owner }) {
      scanQR(owner, ['login', 'abcdef123']);
    },
  },
  SCAN_INVALID: {
    async exec({ owner }) {
      scanQR(owner, { obj: 'not allowed' });
    },
  },
  // END SCANNING
  ////////////////////////////////////////////////////
  // CONNECTING
  CONNECTION_SUCCESS: {
    async exec({ connection }) {
      connection.setup.resolve();
    },
  },
  CONNECTION_FAILURE: {
    async exec({ connection }) {
      connection.setup.reject('Some Error');
    },
  },
  // CONNECTING
  ////////////////////////////////////////////////////
  // Authorization from User
  CLICK_ALLOW: {
    async exec() {
      await page.confirm.clickAllow();
    },
  },
  CLICK_DENY: {
    async exec() {
      await page.confirm.clickDeny();
    },
  },
  // Authorization from User
  ////////////////////////////////////////////////////
  // TRANSFERRING
  TRANSFER_SUCCESS: {
    async exec({ connection }) {
      connection.fakeTransfer.resolve();
    },
  },
  TRANSFER_FAILED: {
    async exec({ connection }) {
      connection.fakeTransfer.reject();
    },
  },
  // TRANSFERRING
  ////////////////////////////////////////////////////
});

module('Acceptance | QR | Login | Sender', function (hooks) {
  setupApplicationTest(hooks);
  setupEmberclearTest(hooks);

  let fakeTransfer: RSVP.Deferred<void>;
  let fakeConnection: TestMachineContext['connection'];

  hooks.beforeEach(function (this: TestContext) {
    fakeTransfer = RSVP.defer<void>();
    fakeConnection = {
      fakeTransfer,
      setup: RSVP.defer<void>(),
      transferToDevice() {
        return fakeTransfer.promise;
      },
    };

    class TestNavigator extends NavigatorService {
      get mediaDevices(): any {
        return {
          getUserMedia() {
            return Promise.resolve(
              {
                getTracks: () => [],
              } /* fake cameraStream */
            );
          },
        };
      }
    }

    class TestQRManager extends Service {
      login = {
        async setupConnection() {
          await fakeConnection.setup.promise;

          return fakeConnection;
        },
      };
    }

    this.owner.register('service:browser/navigator', TestNavigator);
    this.owner.register('service:qr-manager', TestQRManager);
  });

  module('User is logged in', function (hooks) {
    setupCurrentUser(hooks);
    setupXStateTest(hooks, testModel);

    testShortestPaths(testModel, async function (assert, path) {
      await visit('/qr');

      let intl = getService('intl');
      let t = intl.t.bind(intl);

      return path.test({
        t,
        assert,
        owner: this.owner,
        connection: fakeConnection,
      });
    });
  });

  module('User is not logged in', function () {});
});
