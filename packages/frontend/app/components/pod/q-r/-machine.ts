import { MachineConfig, assign, send } from 'xstate';

import { Context, ScanEvent, Schema, QRData, Events } from './-types';
import { MalformedQRCodeError, UnrecognizedQRCodeError } from 'emberclear/utils/errors';

function parseScannedData(_: Context, event: ScanEvent) {
  let { data } = event;
  let parsed = JSON.parse(data) as QRData;

  let isValid = Array.isArray(parsed);

  if (!isValid) {
    throw new MalformedQRCodeError();
  }

  // TODO: assert using JSON schema
  if (parsed[0] === 'login') {
    if (!parsed[1].pub) {
      throw new UnrecognizedQRCodeError();
    }
  }

  return Promise.resolve(parsed);
}

// https://xstate.js.org/viz/?gist=ae6c4b8e7d1c9b05a5510c5bf0303890
export const machineConfig: MachineConfig<Context, Schema, Events> = {
  id: 'scan-qr-code',
  strict: true,
  initial: 'scanner',
  context: {
    intent: undefined,
    data: undefined,
    error: undefined,
  },
  states: {
    scanner: {
      id: 'scanner',
      initial: 'scanning',
      onDone: [
        {
          target: '#loginToDevice',
          cond: 'isQRLogin',
        },
        {
          target: '#addFriend',
          cond: 'isQRAddFriend',
        },
        // else: unrecognized target, ignore and
        // keep scanning until we recognize a code
      ],
      states: {
        scanning: {
          on: {
            SCAN: 'parsing',
          },
        },
        parsing: {
          invoke: {
            id: 'parseScan',
            src: parseScannedData,
            onDone: {
              // target: 'scanned',
              actions: [
                assign({
                  intent: (_, event) => event.data[0],
                  data: (_, event) => event.data[1],
                }),
                send('PARSED'),
              ],
            },
            onError: { target: '#error' },
          },
          on: {
            PARSED: 'scanned',
          },
        },
        scanned: {
          type: 'final',
        },
      },
    },
    error: {
      id: 'error',
      on: {
        RETRY: '#scanner',
      },
    },
    loginToDevice: {
      id: 'loginToDevice',
      initial: 'checkLogin',
      states: {
        checkLogin: {
          on: {
            '': [
              {
                target: 'setupConnection',
                cond: 'isLoggedIn',
              },
              { target: '#error' },
            ],
          },
        },
        setupConnection: {
          invoke: {
            id: 'setup-connection',
            src: 'setupConnection',
            onDone: 'askPermission',
            onError: '#error',
          },
        },
        askPermission: {
          on: {
            DENY: '#error',
            ALLOW: 'transferAllowed',
          },
        },
        transferAllowed: {
          exit: ['destroyConnection'],
          invoke: {
            id: 'transfer-data',
            src: 'transferData',
            onDone: 'transferComplete',
            onError: '#error',
          },
        },
        transferComplete: {
          type: 'final',
        },
      },
    },
    addFriend: {
      id: 'addFriend',
      initial: 'determineExistence',
      // context: {
      //   exists: false,
      // },
      states: {
        determineExistence: {
          entry: ['doesContactExist', send('HANDLE_EXISTENCE')],
          on: {
            HANDLE_EXISTENCE: [
              {
                target: 'contactExists',
                cond: 'isContactKnown',
              },
              {
                target: 'needToAddContact',
                actions: ['addContact'],
              },
            ],
          },
        },
        needToAddContact: {},
        contactExists: {},
      },
    },
  },
};
