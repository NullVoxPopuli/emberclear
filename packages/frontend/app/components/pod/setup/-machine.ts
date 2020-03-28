import { Machine, send, assign } from 'xstate';

export interface Context {}

export type Schema = {
  states: {
    idle: {};
    creating: {};
    overwrite: {};
    completed: {};
  };
  guards: {
    isLoggedIn: () => boolean;
  };
};

export type Event =
  | { type: 'CREATE' }
  | { type: 'SUBMIT_NAME' }
  | { type: 'DO_IT_ANYWAY' }
  | { type: 'CANCEL' };

export function setupMachine() {
  return Machine<Context, Schema, Event>({
    id: 'setup-user',
    initial: 'idle',
    context: {},
    states: {
      idle: {
        entry: send('CREATE'),
        on: {
          CREATE: [
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
        entry: assign({
          next: () => 'SUBMIT_NAME',
        }),
        on: {
          SUBMIT_NAME: 'completed',
        },
      },
      overwrite: {
        entry: assign({
          next: () => 'DO_IT_ANYWAY',
          prev: () => 'CANCEL',
        }),
        on: {
          DO_IT_ANYWAY: {
            target: 'creating',
            actions: ['logout'],
          },
          CANCEL: {
            actions: ['redirectHome'],
          },
        },
      },
      completed: {
        type: 'final',
      },
    },
  });
}
