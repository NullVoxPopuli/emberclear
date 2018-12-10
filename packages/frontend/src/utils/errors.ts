export class NoCameraError extends Error {
  constructor(...props: any[]) {
    super(...props);

    this.name = 'NoCameraError';
  }
}

export class ConnectionError extends Error {}
