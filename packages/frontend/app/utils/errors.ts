export class MalformedQRCodeError extends Error {}
export class UnrecognizedQRCodeError extends Error {}

export class NoCameraError extends Error {
  constructor(...props: any[]) {
    super(...props);

    this.name = 'NoCameraError';
  }
}

export class ConnectionError extends Error {}
export class RelayNotSetError extends Error {
  name = 'RelayNotSet';
}

export class CurrentUserNotFound extends Error {
  name = 'CurrentUserNotFound';
}
