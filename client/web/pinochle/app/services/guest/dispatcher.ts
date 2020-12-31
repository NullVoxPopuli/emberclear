import Service from '@ember/service';

export default class GuestDispatcher extends Service {}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'guest/dispatcher': GuestDispatcher;
  }
}
