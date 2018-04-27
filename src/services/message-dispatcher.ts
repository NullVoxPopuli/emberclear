import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class MessageDispatcher extends Service {
  toast = service('toast');
  redux = service('redux');
  relayConnection = service('relay-connection');
}

declare module '@ember/service' {
  interface Registry {
    'message-dispatcher': MessageDispatcher
  }
}
