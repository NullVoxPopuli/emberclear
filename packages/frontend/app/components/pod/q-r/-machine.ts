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
      error: context.t('qr.scan.malformed'),
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
            cond: ({ intent }) => intent === 'login',
          },
          {
            target: 'addFriend',
            cond: ({ intent }) => intent === 'add-friend',
          },
          {
            target: 'error',
            cond: ({ error }) => error === 'error',
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
      initial: 'askPermission',
      on: {
        RETRY: 'scanning',
      },
      states: {
        askPermission: {
          // TODO: need condition to check if logged in
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
              actions: assign({
                error: (_context, event: ErrorEvent) => {
                  console.error(event.data);
                  return event.data;
                },
              }),
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
                cond: ({ exists }) => exists,
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
