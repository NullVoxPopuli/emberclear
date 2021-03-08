import type { MessageFromHost, MessageFromUi } from '../types';
import type { MachineConfig, StateSchema } from 'xstate';

export type Event = MessageFromHost | MessageFromUi;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context {
  /* no context */
}
export interface Schema extends StateSchema<Context> {
  states: {
    idle: StateSchema<Context>;
    inGame: StateSchema<Context>;
  };
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'host-message-handler',
  initial: 'idle',
  on: {
    PING: {
      actions: ['pong'],
    },
    PONG: {
      // noop
    },
  },
  states: {
    idle: {
      on: {
      },
    },
  },
};
