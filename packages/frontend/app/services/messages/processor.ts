import Service from '@ember/service';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import ReceivedMessageHandler from 'emberclear/services/messages/handler/service';

import { decryptFromSocket } from './-utils/decryptor';

export default class MessageProcessor extends Service {
  @service currentUser!: CurrentUserService;
  @service('messages/handler') handler!: ReceivedMessageHandler;

  async receive(socketData: RelayMessage) {
    const decrypted = await decryptFromSocket(socketData, this.currentUser.privateKey!);

    await this.handler.handle(decrypted);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/processor': MessageProcessor;
  }
}
