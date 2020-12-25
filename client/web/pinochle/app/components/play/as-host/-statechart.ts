import type { Card } from 'pinochle/game/card';
import type { Trick } from 'pinochle/game/trick';
import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  deck: Card[];
  players: {
    [id: string]: Card[];
  };
  tricks: Trick[];
  playerOrder: string[];
};

export type Event = { type: 'START_GAME_FAILED' } | { type: 'CONNECTED' };

export interface Schema extends StateSchema<Context> {
  states: {
    'waiting-for-players-to-be-ready': StateSchema<Context>;
  };
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  states: {
    'waiting-for-players-to-be-ready': {},
  },
};
