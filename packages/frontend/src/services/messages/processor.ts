import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';

import { decryptFrom } from 'emberclear/src/utils/nacl/utils';
import { fromString, fromHex, toString } from 'emberclear/src/utils/string-encoding';

export default class MessageProcessor extends Service {
  // anything which *must* be merged to prototype here
  // toast = service('toast');
  @service identity!: IdentityService;
  @service relayConnection!: RelayConnection;

  async receive(socketData: RelayMessage) {
    const { uid, message } = socketData;
    const senderPublicKey = fromHex(uid);
    const recipientPrivateKey = this.identity.privateKey!;

    const decrypted = await this.decryptMessage(message, senderPublicKey, recipientPrivateKey);
    // once received, parse it into a message,
    // and save it. ember-data and the routing
    // will take care of where to place the
    // message in the UI
  }

  async decryptMessage(message: string, senderPublicKey: Uint8Array, recipientPrivateKey: Uint8Array) {
    const messageBytes = fromHex(message);

    const decrypted = await decryptFrom(
      messageBytes, senderPublicKey, recipientPrivateKey
    );

    const payload = toString(decrypted);
    const data = JSON.parse(payload);

    return data;
  }

}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/processor': MessageProcessor
  }
}
