type EventObject = import('xstate').EventObject;

export interface Context {
  intent?: string;
  data?: QRData[1];
  error?: string;
}

export type LoginQRData = [
  string,
  {
    pub: string;
    verify: string;
  }
];

export type QRData = LoginQRData;

export type ErrorEvent = { type: 'error.execution'; data: string };
export type ScanEvent = { type: 'SCAN'; data: string };
type AllowEvent = { type: 'ALLOW' };
type RetryEvent = { type: 'RETRY' };
type DenyEvent = { type: 'DENY' };
type HandleExistenceEvent = { type: 'HANDLE_EXISTENCE' };

type ParsedEvent = { type: 'PARSED' };

type EmptySubState = Record<string, unknown>;

interface ScannerSubMachine {
  Schema: {
    states: {
      scanning: EmptySubState;
      parsing: EmptySubState;
      scanned: EmptySubState;
    };
  };

  Event: ScanEvent | ParsedEvent | RetryEvent | EventObject;
}

interface LoginSubMachine {
  Schema: {
    states: {
      checkLogin: EmptySubState;
      setupConnection: EmptySubState;
      askPermission: EmptySubState;
      transferAllowed: EmptySubState;
      transferComplete: EmptySubState;
    };
  };

  Event: AllowEvent | DenyEvent | RetryEvent | ErrorEvent | ScanEvent | ParsedEvent | EventObject;
}

interface AddContactSubMachine {
  Schema: {
    states: {
      determineExistence: EmptySubState;
      needToAddContact: EmptySubState;
      contactExists: EmptySubState;
    };
  };

  Event: HandleExistenceEvent | EventObject;
}

export interface Schema {
  states: {
    error: EmptySubState;
    scanner: ScannerSubMachine['Schema'];
    loginToDevice: LoginSubMachine['Schema'];
    addFriend: AddContactSubMachine['Schema'];
  };
  actions: {
    doesContactExist: (publicKeyAsHex: string) => boolean;
  };
  services: {
    transferData: (ephemeralPublicKeyAsHex: string) => Promise<void>;
    addContact: (publicKeyAsHex: string, name: string) => Promise<void>;
    parseScannedData: (ctx: Context, event: ScanEvent) => Promise<QRData>;
  };
}

export type Events =
  | LoginSubMachine['Event']
  | AddContactSubMachine['Event']
  | ScannerSubMachine['Event'];
