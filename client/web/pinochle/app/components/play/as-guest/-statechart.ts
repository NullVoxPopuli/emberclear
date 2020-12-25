import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  name: string;
};

export type Event = { type: 'START_GAME_FAILED' } | { type: 'CONNECTED' };

export interface Schema extends StateSchema<Context> {
  states: {
    'waiting-for-hand': StateSchema<Context>;
  };
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  states: {
    'waiting-for-hand': {},
  },
};
