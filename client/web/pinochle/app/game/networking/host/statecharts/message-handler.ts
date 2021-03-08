import type { MessageFromGuest, MessageFromUi } from '../types';
import type { MachineConfig, StateSchema } from 'xstate';

export type Event = MessageFromGuest | MessageFromUi;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context {
  /* no context */
}
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
    PONG: {
      // noop
    },
    // heartbeat starts after the guest joins
    HEARTBEAT: [
      {
        cond: 'isPlayerKnown',
        actions: ['markOnline', 'broadcastPlayerList'],
      },
      {
        actions: ['sendNotRecognized'],
      },
    ],
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
          cond: 'hasEnoughPlayers',
          target: 'inGame',
          actions: ['beginGame'],
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
