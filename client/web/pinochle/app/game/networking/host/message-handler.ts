import { actions, assign, send } from 'xstate';

import type { MessageFromGuest } from './types';
import type { MachineConfig, StateSchema } from 'xstate';

export type Event = MessageFromGuest & { fromId: string };

export interface Context {}
export interface Schema extends StateSchema<Context> {
  idle: StateSchema<Context>;
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'host-message-handler',
  initial: 'idle',
  states: {
    idle: {
      on: {
        GUEST_HEARTBEAT: {
          cond: 'isPlayerKnown',
          actions: ['markOnline'],
        },
        UI__START_GAME: {
          actions: [
            {
              cond: 'hasEnoughPlayers',
              actions: ['startGame'],
            },
          ],
        },
      },
    },
    inGame: {
      entry: ['startOnlineChecker', 'broadcastStart'],
      on: {
        GUEST_HEARTBEAT: [
          {
            cond: 'isPlayerKnown',
            actions: ['markOnline'],
          },
          {
            actions: ['logUnexpectedMessage'],
          },
        ],
      },
    },
  },
};
