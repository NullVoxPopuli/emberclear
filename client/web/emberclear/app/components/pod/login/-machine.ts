import { MachineConfig } from 'xstate';

type EventObject = import('xstate').EventObject;

// https://xstate.js.org/viz/?gist=15a3eb8b7d7c391bcce21d86a041a497

type Context = Record<string, unknown>;

export type Events =
  | { type: 'SUBMIT' }
  | { type: 'UPLOAD' }
  | { type: 'RECEIVE_QR_SYN' }
  | { type: 'IMPORT' }
  | { type: 'CANCEL' }
  | { type: 'ERROR' }
  | { type: 'DONE' }
  | { type: 'RETRY' }
  | EventObject;

type EmptySubState = Record<string, unknown>;

export interface Schema {
  states: {
    waitForData: EmptySubState;
    qrScanned: EmptySubState;
    uploadFile: EmptySubState;
    importData: EmptySubState;
    processLogin: EmptySubState;
    success: EmptySubState;
    error: EmptySubState;
  };
  actions: {
    restartEphemeralConnection: () => Promise<void>;
  };
}

export const machineConfig: MachineConfig<Context, Schema, Events> = {
  id: 'login',
  initial: 'waitForData',
  context: {},
  states: {
    waitForData: {
      onEntry: 'restartEphemeralConnection',
      on: {
        // after typing it all in
        SUBMIT: 'processLogin',
        // after selecting a file?
        UPLOAD: 'uploadFile',
        // triggered by connection class
        RECEIVE_OR_SYN: 'qrScanned',
      },
    },

    qrScanned: {
      on: {
        IMPORT: 'importData',
        CANCEL: 'waitForData',
        ERROR: 'error',
      },
    },

    uploadFile: {
      invoke: {
        id: 'handle-file',
        src: 'handleFile',
        onDone: 'importData',
        onError: 'error',
      },
    },

    importData: {
      // shows progress
      on: {
        DONE: 'success',
        ERROR: 'error',
      },
    },

    error: {
      on: { RETRY: '#login' },
    },

    processLogin: {
      invoke: {
        id: 'handle-login',
        src: 'handleLogin',
        onDone: 'success',
        onError: 'error',
      },
    },

    success: {
      onEntry: ['teardownConnection', 'toChats'],
      type: 'final',
    },
  },
};
