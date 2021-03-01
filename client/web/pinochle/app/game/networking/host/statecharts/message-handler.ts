import { actions, assign, send } from 'xstate';

import type { MessageFromGuest } from './types';
import type { MachineConfig, StateSchema } from 'xstate';

export type Event =
  | MessageFromGuest
  | {
      type: 'UI__START_GAME';
    }
  | { type: 'PING' };

export interface Context {}
export interface Schema extends StateSchema<Context> {
  states: {
    idle: StateSchema<Context>;
    inGame: StateSchema<Context>;
  };
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'host-message-handler',
  initial: 'idle',
  on: {
    PING: {
      actions: ['pong'],
    },
    GUEST_HEARTBEAT: {
      actions: [
        {
          cond: 'isPlayerKnown',
          actions: ['markOnline', 'broadcastPlayerList'],
        },
        {
          actions: ['sendNotRecognized'],
        },
      ],
    },
  },
  states: {
    idle: {
      on: {
        JOIN: [
          {
            cond: 'gameIsFull',
            actions: ['notifyGameIsFull'],
          },
          { actions: ['addPlayerToGame', 'broadcastPlayerList'] },
        ],
        UI__START_GAME: {
          actions: [
            {
              cond: 'hasEnoughPlayers',
              target: 'inGame',
              actions: ['beginGame'],
            },
          ],
        },
      },
    },
    inGame: {
      entry: ['startOnlineChecker', 'broadcastStart'],
      on: {
        PLAY: [
          {
            actions: ['forwardToGameMachine'],
          },
        ],
      },
    },
  },
};
