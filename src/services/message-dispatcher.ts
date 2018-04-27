import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class MessageDispatcher extends Service {
  toast = service('toast');
  redux = service('redux');
  relayConnection = service('relay-connection');
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'message-dispatcher': MessageDispatcher
  }
}
