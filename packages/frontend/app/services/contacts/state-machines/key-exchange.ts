import { Machine } from 'xstate';

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
//
//https://statecharts.github.io/xstate-viz/

export interface Schema {
  states: {
    IDLE: {},
    CONNECTED: {},
    REMOTE_INITIATED: {},
    WE_INITIATED: {},
    RATCHET_COMPLETE: {}
  }
}

export type Event =
  | { type: 'CONNECT' }
  | { type: 'DISCONNECT' }
  | { type: 'ONLINE_CONFIRMED' }
  | { type: 'RECEIVED_KEY' }
  | { type: 'COMPLETED' }
  | { type: 'SENT_KEY' }

const TRANSITION = {
  CONNECT: 'CONNECT',
  DISCONNECT: 'DISCONNECT',
  ONLINE_CONFIRMED: 'ONLINE_CONFIRMED',
  RECEIVED_KEY: 'RECEIVED_KEY',
  COMPLETED: 'COMPLETED',
};

export const ratchetMachine = Machine<{}, Schema, Event>({
  id: 'key-exchange',
  initial: 'IDLE',
  states: {
    IDLE: {
      on: { [TRANSITION.CONNECT]: ['CONNECTED'] },
    },

    CONNECTED: {
      on: {
        ONLINE_CONFIRMED: 'WE_INITIATED',
        RECEIVED_KEY: 'REMOTE_INITIATED',
      },
    },

    REMOTE_INITIATED: {
      on: { SENT_KEY: 'RATCHET_COMPLETE' },
    },

    WE_INITIATED: {
      on: { RECEIVED_KEY: 'RATCHET_COMPLETE' },
    },

    RATCHET_COMPLETE: {
      on: { [TRANSITION.DISCONNECT]: 'IDLE' },
    },
  },
});
