import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import ReceivedMessageHandler from 'emberclear/src/services/messages/handler/service';

import { decryptFromSocket } from './-utils/decryptor';

export default class MessageProcessor extends Service {
  @service identity!: IdentityService;
  @service('messages/handler') handler!: ReceivedMessageHandler;

  async receive(socketData: RelayMessage) {
    const decrypted = await decryptFromSocket(socketData, this.identity.privateKey!);

    await this.handler.handle(decrypted);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/processor': MessageProcessor
  }
}
