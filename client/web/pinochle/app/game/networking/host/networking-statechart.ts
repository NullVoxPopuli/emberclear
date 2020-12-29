import { actions, assign, send } from 'xstate';

import type { JoinMessage, PlayCard, Present, RequestState } from '../types';
import type { MachineConfig, StateSchema } from 'xstate';

export type NetworkMessage = { fromUid: string };

type Event = NetworkMessage & (JoinMessage | Syn | RequestState | Present | PlayCard);

interface Context {
  isStarted: false;
  canStart: false,
}

interface Schema extends StateSchema<Context> {
  'check-ready-status': StateSchema<Context>;
  'waiting-for-players': StateSchema<Context>;
  'game-active': StateSchema<Context>;
  'between-games': StateSchema<Context>;
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'host-networking',
  initial: 'check-ready-status',
  context: { isStarted: false, canStart: false },
  states: {
    'check-ready-status': {
      entry: 'loadData',
    },
    'waiting-for-players': {
      on: {
        JOIN: {
          actions: actions.choose([
            {
              cond: 'isPlayerKnown',
              actions: ['broadcastJoin'],
            },
            { actions: ['addPlayer'] },
          ]),
        },
        SYN: { actions: ['replyAck'] },
        REQUEST_STATE: {
          actions: actions.choose([{ cond: 'isPlayerKnown', actions: ['replyState'] }]),
        },
        PRESENT: {
          actions: actions.choose([
            {
              cond: 'isPlayerKnown',
              actions: ['markOnline'],
            },
          ]),
        },
      },
    },
    'game-active': {},
    'between-games': {},
  },
};
