import { MachineConfig, assign, send } from 'xstate';

import { Context, ScanEvent, Schema, ErrorEvent, QRData } from './-types';

const parseScannedData = assign((context: Context, event: ScanEvent) => {
  let { data } = event;
  let parsed: QRData;

  try {
    parsed = JSON.parse(data);
  } catch (e) {
    // JSON malformed. likely that the QR Code was a partial read.
    return {
      ...context,
      parseError: e,
    };
  }

  let isValid = Array.isArray(parsed);

  if (!isValid) {
    return {
      ...context,
      error: context.t('qrCode.malformed'),
      parseError: undefined,
    };
  }

  return {
    ...context,
    parseError: undefined,
    error: undefined,
    intent: parsed[0],
    data: parsed[1],
  };
});

const handleError = assign((context: Context, event: ErrorEvent) => {
  return { ...context, error: event.data };
});

// https://xstate.js.org/viz/?gist=ae6c4b8e7d1c9b05a5510c5bf0303890
export const machineConfig: MachineConfig<Context, Schema, Event> = {
  id: 'scan-qr-code',
  strict: true,
  initial: 'scanning',
  context: {
    intent: undefined,
    data: undefined,
    error: undefined,
    parseError: undefined,
    t: () => '',
  },
  states: {
    scanning: {
      on: {
        SCAN: {
          target: 'scanned',
        },
      },
    },
    scanned: {
      entry: [parseScannedData, send('PARSED')],
      on: {
        PARSED: [
          {
            target: 'loginToANewDevice',
            cond: 'isQRLogin',
          },
          {
            target: 'addFriend',
            cond: 'isQRAddFriend',
          },
          {
            target: 'error',
            cond: 'hasError',
          },
          // parseError is ignored, and we go back to scanning
          { target: 'scanning' },
        ],
      },
    },
    error: {
      on: {
        RETRY: 'scanning',
      },
    },
    loginToANewDevice: {
      initial: 'determineIfAllowed',
      on: {
        RETRY: 'scanning',
      },
      states: {
        determineIfAllowed: {
          entry: send('CHECK_LOGGED_IN'),
          on: {
            CHECK_LOGGED_IN: [
              {
                target: 'askPermission',
                cond: 'isLoggedIn',
              },
              { target: 'notLoggedIn' },
            ],
          },
        },
        notLoggedIn: {},
        askPermission: {
          on: {
            DENY: 'transferDenied',
            ALLOW: 'transferAllowed',
          },
        },
        transferDenied: {},
        transferAllowed: {
          exit: ['destroyConnection'],
          invoke: {
            id: 'transfer-data',
            src: 'transferData',
            onDone: 'transferComplete',
            onError: {
              target: 'transferError',
              actions: [handleError],
            },
          },
        },
        transferComplete: {
          type: 'final',
        },
        transferError: {},
      },
    },
    addFriend: {
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
