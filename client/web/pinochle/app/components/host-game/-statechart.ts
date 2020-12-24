// import { send } from 'xstate';

import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  numPlayers: number;
  connectedPlayers: string[];
};

export type Event = { type: 'START_GAME_FAILED' } | { type: 'BOOT_HOST' };

export interface Schema extends StateSchema<Context> {
  states: {
    'waiting-for-players': StateSchema<Context>;
  };
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'game-host',
  on: {},
  context: { numPlayers: 0, connectedPlayers: [] },
  initial: 'waiting-for-players',
  states: {
    'waiting-for-players': {
      entry: 'establishConnection',
    },
  },
};
