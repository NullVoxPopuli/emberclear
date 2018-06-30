import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

// giant block o' types
import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';
import Message from 'emberclear/data/models/message';
import Identity from 'emberclear/data/models/identity/model';

import { encryptFor } from 'emberclear/src/utils/nacl/utils';
import { toUint8Array, toBase64, toHex } from 'emberclear/src/utils/string-encoding';

export default class MessageDispatcher extends Service {
  @service notifications!: Notifications;
  @service store!: DS.Store;
  @service relayConnection!: RelayConnection;
  @service identity!: IdentityService;

  sendMessage(messageText: string) {
    let msg = this.store.createRecord('message', {
      from: this.identity.name,
      body: messageText,
      sentAt: new Date(),
      receivedAt: new Date()
    });

    msg.save();

    this.sendToAll(msg)
  }

  // the downside to end-to-end encryption
  // the bigger the list of identities, the longer this takes
  async sendToAll(msg: Message) {
    const everyone = await this.store.findAll('identity');

    everyone.forEach(identity => {
      if (identity.id === 'me') return; // don't send to self

      this.sendToUser(msg, identity);
    });
  }

  async sendToUser(msg: Message, to: Identity) {
    const myPrivateKey = this.identity.privateKey as Uint8Array;
    const theirPublicKey = to.publicKey as Uint8Array;
    const uid = toHex(theirPublicKey);

    const payload = this.messageToPayloadJson(msg);

    const encryptedMessage = await this.encryptMessage(payload, theirPublicKey, myPrivateKey);

    this.relayConnection.send(uid, encryptedMessage, msg);
  }

  async encryptMessage(payload: any, theirPublicKey: Uint8Array, myPrivateKey: Uint8Array): Promise<string> {
    const payloadString = JSON.stringify(payload);
    const payloadBytes = toUint8Array(payloadString);

    const encryptedMessage = await encryptFor(payloadBytes, theirPublicKey, myPrivateKey);

    return await toBase64(encryptedMessage);
  }

  messageToPayloadJson(msg: Message): RelayJson {
    return {
      type: 'chat',
      client: '',
      client_version: '',
      time_sent: msg.sentAt,
      sender: {
        name: msg.from,
        uid: toHex(this.identity.publicKey!),
        location: ''
      },
      message: {
        channel: msg.channel,
        thread: msg.thread,
        body: msg.body,
        contentType: msg.contentType
      }
    }
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/dispatcher': MessageDispatcher
  }
}
