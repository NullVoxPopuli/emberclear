import { Machine } from 'xstate';

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
//
//https://statecharts.github.io/xstate-viz/

const STATE = {
  IDLE: 'IDLE',
  CONNECTED: 'CONNECTED',
  REMOTE_INITIATED: 'REMOTE_INITIATED',
  WE_INITIATED: 'WE_INITIATED',
  RATCHET_COMPLETE: 'RATCHET_COMPLETE',
};

const TRANSITION = {
  CONNECT: 'CONNECT',
  DISCONNECT: 'DISCONNECT',
  ONLINE_CONFIRMED: 'ONLINE_CONFIRMED',
  RECEIVED_KEY: 'RECEIVED_KEY',
  COMPLETED: 'COMPLETED',
};

export const ratchetMachine = Machine({
  id: 'key-exchange',
  initial: STATE.IDLE,
  states: {
    [STATE.IDLE]: {
      on: { [TRANSITION.CONNECT]: [STATE.CONNECTED] },
    },

    [STATE.CONNECTED]: {
      on: {
        ONLINE_CONFIRMED: STATE.WE_INITIATED,
        RECEIVED_KEY: STATE.REMOTE_INITIATED,
      },
    },

    [STATE.REMOTE_INITIATED]: {
      on: { SENT_KEY: STATE.RATCHET_COMPLETE },
    },

    [STATE.WE_INITIATED]: {
      on: { RECEIVED_KEY: STATE.RATCHET_COMPLETE },
    },

    [STATE.RATCHET_COMPLETE]: {
      on: { [TRANSITION.DISCONNECT]: STATE.IDLE },
    },
  },
});
