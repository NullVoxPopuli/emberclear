import { Machine } from 'xstate';

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
//
//https://statecharts.github.io/xstate-viz/
export interface Schema {
  states: {
    IDLE: {};
    WAITING_FOR_START: {
      states: {
        WAITING_FOR_AUTH: {};
        AUTHORIZED: {};
      };
    };
    SCANNED_TARGET: {
      states: {
        WAITING_FOR_CODE: {};
        WAITING_FOR_DATA: {};
      };
    };
  };
}

export type Event =
  | { type: 'INITIATE_TRANSFER_REQUEST' }
  | { type: 'SCAN_TARGET_PROFILE' }
  | { type: 'RECEIVE_READY' }
  | { type: 'RECEIVE_CODE' }
  | { type: 'DATA_SENT' }
  | { type: 'SEND_READY' }
  | { type: 'SEND_CODE' }
  | { type: 'DATA_RECEIVED' };

export const TRANSITION = {
  START: 'INITIATE_TRANSFER_REQUEST',
  SCAN_TARGET_PROFILE: 'SCAN_TARGET_PROFILE',
  RECEIVE_READY: 'RECEIVE_READY',
  RECEIVE_CODE: 'RECEIVE_CODE',
  DATA_SENT: 'DATA_SENT',
  SEND_READY: 'SEND_READY',
  SEND_CODE: 'SEND_CODE',
  DATA_RECEIVED: 'DATA_RECEIVED',
};

export const transferToDeviceMachine = Machine<{}, Schema, Event>({
  id: 'transfer-to-device',
  initial: 'IDLE',
  states: {
    IDLE: {
      on: {
        [TRANSITION.START]: 'WAITING_FOR_START',
        [TRANSITION.SCAN_TARGET_PROFILE]: 'SCANNED_TARGET',
      },
    },

    // START
    // generate ehemeral keys
    // generate QR Code to scan
    //  - only contains public key
    WAITING_FOR_START: {
      on: {
        [TRANSITION.RECEIVE_READY]: 'WAITING_FOR_START.WAITING_FOR_AUTH',
      },
      initial: 'WAITING_FOR_AUTH',
      states: {
        // this is where the originator waits for
        // the new device to send a code confirm that
        // they are owned by the same person.
        //
        // generate code
        // - display code on screen
        // - do NOT send the code.
        WAITING_FOR_AUTH: {
          on: {
            [TRANSITION.RECEIVE_CODE]: 'AUTHORIZED',
          },
        },

        AUTHORIZED: {
          on: {
            [TRANSITION.DATA_SENT]: 'IDLE',
          },
        },
      },
    },

    // scan QR Code
    // generate ehemeral keys
    //  - scanned public key is originator
    // send "ready" message to originator
    SCANNED_TARGET: {
      on: {
        [TRANSITION.SEND_READY]: 'WAITING_FOR_CODE',
      },
      initial: 'WAITING_FOR_CODE',
      states: {
        WAITING_FOR_CODE: {
          on: {
            [TRANSITION.SEND_CODE]: 'WAITING_FOR_DATA',
          },
        },

        WAITING_FOR_DATA: {
          on: {
            [TRANSITION.DATA_RECEIVED]: 'IDLE',
          },
        },
      },
    },
  },
});
