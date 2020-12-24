import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  connectedPlayers: string[];
};

export type Event = { type: 'boop' };

export interface Schema extends StateSchema<Context> {
  states: {
    init: StateSchema<Context>;
  };
}

export const statechart: MachineConfig<Context, Schema, Event> = {};
