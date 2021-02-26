import Ember from 'ember';

import { assign, send } from 'xstate';

import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  name: string;
  retryCount?: number;
};

type SubmitNameEvent = { type: 'SUBMIT_NAME'; name: string };

export type Event =
  | { type: 'START_GAME_FAILED' }
  | { type: 'CONNECTED' }
  | { type: 'RETRY' }
  | { type: 'ERROR'; error?: Error }
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
        CONNECTED: [
          {
            target: 'joining',
            cond: (ctx) => ctx.name.length > 0,
          },
          {
            target: 'needs-name',
          },
        ],
        RETRY: 'begin',
        ERROR: [
          {
            actions: [
              // eslint-disable-next-line ember/no-ember-testing-in-module-scope
              send('RETRY', { delay: Ember.testing ? 100 : 1000 }),
              assign({ retryCount: (ctx) => (ctx.retryCount || 0) + 1 }),
            ],
            cond: (ctx) => (ctx.retryCount || 0) < 5,
          },
          { target: 'game-does-not-exist' },
        ],
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
        ERROR: 'game-does-not-exist',
      },
    },
    starting: {
      entry: 'startGame',
    },
  },
};
