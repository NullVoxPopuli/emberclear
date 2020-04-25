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

interface ScannerSubMachine {
  Schema: {
    states: {
      scanning: {};
      parsing: {};
      scanned: {};
    };
  };

  Event: ScanEvent | ParsedEvent | RetryEvent | EventObject;
}

interface LoginSubMachine {
  Schema: {
    states: {
      checkLogin: {};
      askPermission: {};
      transferAllowed: {};
      transferComplete: {};
    };
  };

  Event: AllowEvent | DenyEvent | RetryEvent | ErrorEvent | ScanEvent | ParsedEvent | EventObject;
}

interface AddContactSubMachine {
  Schema: {
    states: {
      determineExistence: {};
      needToAddContact: {};
      contactExists: {};
    };
  };

  Event: HandleExistenceEvent | EventObject;
}

export interface Schema {
  states: {
    error: {};
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
    parseScannedData: Function;
  };
}

export type Event = LoginSubMachine['Event'] | AddContactSubMachine['Event'];
