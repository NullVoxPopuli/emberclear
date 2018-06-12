import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

// giant block o' types
import RelayConnection from 'emberclear/services/relay-connection';
import Redux from 'emberclear/services/redux';
import MessagePersistence from 'emberclear/services/messages/persistence';
import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';
import Message from 'emberclear/data/models/message';
import Identity from 'emberclear/data/models/identity/model';

import { encryptFor } from 'emberclear/src/utils/nacl/utils';
import { toUint8Array, toString } from 'emberclear/src/utils/string-encoding';

export default class MessageDispatcher extends Service {
  @service notifications!: Notifications;
  @service store!: DS.Store;
  @service redux!: Redux;
  @service relayConnection!: RelayConnection;
  @service identity!: IdentityService;
  @service('messages/persistence') messagePersistence!: MessagePersistence;

  sendMessage(messageText: string) {
    let msg = this.store.createRecord('message',{
      from: this.identity.name,
      body: messageText,
      sentAt: new Date(),
      receivedAt: new Date()
    });

    this.messagePersistence.append(msg);
    this.sendToAll(msg)
  }

  // the downside to end-to-end encryption
  // the bigger the list of identities, the longer this takes
  sendToAll(msg: Message) {
    this.store.peekAll('identity').forEach(identity => {
      if (identity.id === 'me') return; // don't send to self

      this.sendToUser(msg, identity);
    });
  }

  async sendToUser(msg: Message, to: Identity) {
    const myPrivateKey = this.identity.privateKey as Uint8Array;
    const theirPublicKey = to.publicKey as Uint8Array;

    const payload = this.messageToPayloadJson(msg);
    const payloadString = JSON.stringify(payload);
    const payloadBytes = toUint8Array(payloadString);
    const uid = toString(theirPublicKey);

    const encryptedMessage = await encryptFor(payloadBytes, myPrivateKey, theirPublicKey);

    this.relayConnection.send(uid, toString(encryptedMessage));
  }

  messageToPayloadJson(msg: Message) {
    return {
      type: 'chat',
      client: '',
      client_version: '',
      time_sent: msg.sentAt,
      sender: {
        name: msg.from,
        uid: this.identity.publicKey,
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
