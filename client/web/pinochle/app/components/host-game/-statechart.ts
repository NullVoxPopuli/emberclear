import { assign } from 'xstate';

import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  name: string;
  numPlayers: number;
  connectedPlayers: string[];
};

type SubmitNameEvent = { type: 'SUBMIT_NAME'; name: string };
export type Event =
  | { type: 'START_GAME_FAILED' }
  | { type: 'BOOT_HOST' }
  | { type: 'START_GAME' }
  | SubmitNameEvent;

export interface Schema extends StateSchema<Context> {
  states: {
    'needs-name': StateSchema<Context>;
    'waiting-for-players': StateSchema<Context>;
    'starting-game': StateSchema<Context>;
  };
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'game-host',
  on: {},
  context: { name: '', numPlayers: 0, connectedPlayers: [] },
  initial: 'needs-name',
  states: {
    'needs-name': {
      on: {
        SUBMIT_NAME: 'waiting-for-players',
      },
    },
    'waiting-for-players': {
      entry: [
        assign<Context>({ name: (_, { name }: SubmitNameEvent) => name }),
        'establishConnection',
      ],

      on: {
        START_GAME: 'starting-game',
      },
    },
    'starting-game': {
      entry: ['startGame'],
    },
  },
};
