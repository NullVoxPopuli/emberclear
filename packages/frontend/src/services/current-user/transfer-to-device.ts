import { Machine } from 'xstate';

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
//
//https://statecharts.github.io/xstate-viz/


const STATE = {
  IDLE: 'IDLE',
  STARTED: "STARTED",
  WAITING_FOR_START: 'WAITING_FOR_START',
  WAITING_FOR_AUTH: 'WAITING_FOR_AUTH',
  WAITING_FOR_CODE: 'WAITING_FOR_CODE',
  WAITING_FOR_DATA: 'WAITING_FOR_DATA',
  RECEIVED_REQUEST: 'RECEIVED_TRANSFER_REQUEST',
  AUTHORIZED: 'AUTHORIZED',
};

const TRANSITION = {
  START: 'INITIATE_TRANSFER_REQUEST',
  RECEIVE_REQUEST: 'RECEIVE_TRANSFER_REQUEST',
  RECEIVE_READY: 'RECEIVE_READY',
  RECEIVE_CODE: 'RECEIVE_CODE',
  DATA_SENT: 'DATA_SENT',
  SEND_READY: 'SEND_READY',
  SEND_CODE: 'SEND_CODE',
  DATA_RECEIVED: 'DATA_RECEIVED',
};

export const transferToDeviceMachine = Machine({
  id: 'key-exchange',
  initial: STATE.IDLE,
  states: {
    [STATE.IDLE]: {
      on: {
        [TRANSITION.START]: STATE.WAITING_FOR_START,
        [TRANSITION.RECEIVE_REQUEST]: STATE.RECEIVED_REQUEST,
      },
    },

    // START
    // generate ehemeral keys
    // generate QR Code to scan
    //  - only contains public key
    [STATE.WAITING_FOR_START]: {
      on: {
        [TRANSITION.RECEIVE_READY]: STATE.WAITING_FOR_AUTH
      },
      initial: STATE.WAITING_FOR_AUTH,
      states: {
        // this is where the originator waits for
        // the new device to send a code confirm that
        // they are owned by the same person.
        //
        // generate code
        // - display code on screen
        // - do NOT send the code.
        [STATE.WAITING_FOR_AUTH]: {
          on: {
            [TRANSITION.RECEIVE_CODE]: STATE.AUTHORIZED
          }
        },

        [STATE.AUTHORIZED]: {
          on: {
            [TRANSITION.DATA_SENT]: STATE.IDLE,
          }
        },
      }
    },


    // scan QR Code
    // generate ehemeral keys
    //  - scanned public key is originator
    // send "ready" message to originator
    [STATE.RECEIVED_REQUEST]: {
      on: {
        [TRANSITION.SEND_READY]: STATE.WAITING_FOR_CODE
      },
      initial: STATE.WAITING_FOR_CODE,
      states: {
        [STATE.WAITING_FOR_CODE]: {
          on: {
            [TRANSITION.SEND_CODE]: STATE.WAITING_FOR_DATA
          }
        },

        [STATE.WAITING_FOR_DATA]: {
          on: {
            [TRANSITION.DATA_RECEIVED]: STATE.IDLE,
          }
        }
      }
    },
  },
});
