type EventObject = import('xstate').EventObject;

export interface Context {
  intent?: string;
  data?: QRData[1];
  error?: string;
  parseError?: Error;
  t: Intl['t'];
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
type ParsedEvent = { type: 'PARSED' };
type HandleExistenceEvent = { type: 'HANDLE_EXISTENCE' };

interface LoginSubMachine {
  Schema: {
    states: {
      determineIfAllowed: {};
      notLoggedIn: {};
      askPermission: {};
      transferDenied: {};
      transferAllowed: {};
      transferComplete: {};
      transferError: {};
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
    scanning: {};
    scanned: {};
    error: {};
    loginToANewDevice: LoginSubMachine['Schema'];
    addFriend: AddContactSubMachine['Schema'];
  };
  actions: {
    doesContactExist: (publicKeyAsHex: string) => boolean;
  };
  services: {
    transferData: (ephemeralPublicKeyAsHex: string) => Promise<void>;
    addContact: (publicKeyAsHex: string, name: string) => Promise<void>;
  };
}

export type Event = LoginSubMachine['Event'] | AddContactSubMachine['Event'];
