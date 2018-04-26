import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class MessageProcessor extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  toast = service('toast');
  redux = service('redux');
  relayConnection = service('relay-connection');

}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'relay-connection': MessageProcessor;
  }
}
