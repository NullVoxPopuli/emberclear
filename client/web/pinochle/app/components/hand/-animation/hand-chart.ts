import { assign } from 'xstate';

import { getPoints } from './key-frames';

import type { CardAnimation } from './card';
import type { Card } from 'pinochle/utils/deck';
import type { MachineConfig, StateSchema } from 'xstate';

export type Context = {
  cards: Card[];
  selected?: Card;
  animations: WeakMap<Card, CardAnimation>;
  points?: ReturnType<typeof getPoints>;
  isOpen: boolean;
};

export type SelectEvent = { type: 'SELECT'; card: Card };
export type Event =
  | { type: 'ADJUST' }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' }
  | { type: 'TOGGLE_FAN' }
  | SelectEvent
  | { type: 'start-animation'; animation: Animation };

export interface Schema extends StateSchema<Context> {
  states: {
    'fanned-out': {
      states: {
        idle: StateSchema<Context>;
        'has-selection': {
          states: {
            idle: StateSchema<Context>;
            'confirm-play': StateSchema<Context>;
          };
        };
      };
    };
    closed: StateSchema<Context>;
  };
}

// Almost all of this below here is copy-pastable to the xstate visualizer.
// Just need to not include the const declaration and only copy the
// object contents to the visualizer

function canPlayCard() {
  return false;
}

function isClosed(context: Context) {
  return !context.isOpen;
}

function isOpen(context: Context) {
  return context.isOpen;
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'hand-chart',
  context: { cards: [], isOpen: false, animations: new WeakMap() },
  initial: 'fanned-out',
  on: {
    // called when the window resizes
    ADJUST: {
      actions: [
        assign({
          points: (context) => {
            return getPoints(context.cards.length);
          },
        }),
        'adjustHand',
      ],
    },
    TOGGLE_FAN: [
      {
        target: 'fanned-out',
        cond: isClosed,
        actions: ['fanOpen', assign<Context>({ isOpen: () => true, selected: () => undefined })],
      },
      {
        target: 'closed',
        cond: isOpen,
        actions: ['closeHand', assign<Context>({ isOpen: () => false, selected: () => undefined })],
      },
    ],
  },
  states: {
    'fanned-out': {
      id: 'fanned-out',
      initial: 'idle',
      states: {
        idle: {
          on: {
            SELECT: 'has-selection',
          },
        },
        'has-selection': {
          id: 'selected',
          initial: 'idle',
          entry: [
            assign<Context>({ selected: (_, event: SelectEvent) => event.card }),
            'showSelected',
          ],
          states: {
            idle: {
              on: {
                SELECT: [
                  { target: 'confirm-play', cond: canPlayCard },
                  {
                    target: '#fanned-out.has-selection',
                    actions: ['showSelected'],
                  },
                ],
              },
            },
            'confirm-play': {
              on: {
                CONFIRM: {},
                CANCEL: {},
              },
            },
          },
        },
      },
    },
    closed: {
      on: {},
    },
  },
};
