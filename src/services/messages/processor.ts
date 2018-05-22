import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import RelayConnection from 'emberclear/services/relay-connection';
import Redux from 'emberclear/services/redux';

export default class MessageProcessor extends Service {
  // anything which *must* be merged to prototype here
  // toast = service('toast');
  @service redux!: Redux;
  @service relayConnection!: RelayConnection;

}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'message-processor': MessageProcessor
  }
}
