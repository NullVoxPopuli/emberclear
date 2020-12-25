import { assign } from 'xstate';

import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  name: string;
};

type SubmitNameEvent = { type: 'SUBMIT_NAME'; name: string };

export type Event =
  | { type: 'START_GAME_FAILED' }
  | { type: 'CONNECTED' }
  | { type: 'ERROR' }
  | { type: 'JOINED' }
  | { type: 'START' }
  | SubmitNameEvent;

export interface Schema extends StateSchema<Context> {
  states: {
    'game-does-not-exist': StateSchema<Context>;
    'needs-name': StateSchema<Context>;
    joining: StateSchema<Context>;
    begin: StateSchema<Context>;
    waiting: StateSchema<Context>;
    starting: StateSchema<Context>;
  };
}
export const statechart: MachineConfig<Context, Schema, Event> = {
  initial: 'begin',
  states: {
    begin: {
      entry: 'establishConnection',
      on: {
        CONNECTED: 'needs-name',
        ERROR: 'game-does-not-exist',
      },
    },
    'game-does-not-exist': {},
    'needs-name': {
      on: {
        SUBMIT_NAME: 'joining',
      },
    },
    joining: {
      entry: [assign<Context>({ name: (_, { name }: SubmitNameEvent) => name }), 'joinGame'],
      on: {
        JOINED: 'waiting',
      },
    },
    waiting: {
      on: {
        START: 'starting',
      },
    },
    starting: {
      entry: 'startGame',
    },
  },
};
