import { send, MachineConfig, EventObject } from 'xstate';

export interface Context {
  next?: string;
  prev?: string;
}

export interface Schema {
  states: {
    idle: {};
    creating: {};
    overwrite: {};
    completed: {};
  };
  actions: {
    logout: <T>() => T;
    redirectHome: <T>() => T;
  };
  guards: {
    isLoggedIn: () => boolean;
  };
}

export type Event = { type: 'NEXT' } | { type: 'PREV' } | EventObject;

export const machineConfig: MachineConfig<Context, Schema, Event> = {
  id: 'setup-user',
  strict: true,
  initial: 'idle',
  states: {
    idle: {
      entry: send('NEXT'),
      on: {
        NEXT: [
          {
            target: 'overwrite',
            cond: 'isLoggedIn',
          },
          {
            target: 'creating',
          },
        ],
      },
    },
    creating: {
      on: {
        NEXT: 'completed',
        PREV: 'idle',
      },
    },
    overwrite: {
      on: {
        NEXT: {
          target: 'creating',
          actions: ['logout'],
        },
        PREV: {
          actions: ['redirectHome'],
        },
      },
    },
    completed: {
      type: 'final',
    },
  },
};
