import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';
// import { task } from 'ember-concurrency-decorators';
import { task } from 'ember-concurrency';

// giant block o' types
import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';
import Message from 'emberclear/data/models/message';
import Identity from 'emberclear/data/models/identity/model';
import StatusManager from 'emberclear/services/status-manager';
import MessageFactory from 'emberclear/services/messages/factory';

import { encryptFor } from 'emberclear/src/utils/nacl/utils';
import { toUint8Array, toBase64, toHex } from 'emberclear/src/utils/string-encoding';
import { build as toPayloadJson } from './builder';

export default class MessageDispatcher extends Service {
  @service notifications!: Notifications;
  @service store!: DS.Store;
  @service relayConnection!: RelayConnection;
  @service identity!: IdentityService;
  @service statusManager!: StatusManager;
  @service('messages/factory') messageFactory!: MessageFactory;

  async send(text: string, to: Identity) {
    const msg = this.messageFactory.buildWhisper(text, to);

    await msg.save();

    if (to.id === 'me') return;

    // TODO: channels?
    return await this.get('sendToUser').perform(msg, to);
  }

  async pingAll() {
    const ping = this.store.createRecord('message', {
      from: this.identity.name,
      sentAt: new Date(),
      type: 'ping'
    });

    this.get('sendToAll').perform(ping);
  }

  // the downside to end-to-end encryption
  // the bigger the list of identities, the longer this takes
  // @task * sendToAll(msg: Message) {
  sendToAll = task(function*(this: MessageDispatcher, msg: Message) {
      const everyone = yield this.store.findAll('identity');

    everyone.forEach(identity => {
      if (identity.id === 'me') return; // don't send to self

      this.get('sendToUser').perform(msg, identity);
    });
  // }
  });

  // @task * sendToUser(msg: Message, to: Identity) {
  sendToUser = task(function*(this: MessageDispatcher, msg: Message, to: Identity) {
    const myPrivateKey = this.identity.privateKey as Uint8Array;
    const theirPublicKey = to.publicKey as Uint8Array;
    const uid = toHex(theirPublicKey);

    const payload = toPayloadJson(msg, this.identity.record!);

    const encryptedMessage = yield this.encryptMessage(payload, theirPublicKey, myPrivateKey);

    try {
      yield this.relayConnection.send(uid, encryptedMessage);

      msg.set('receivedAt', new Date());
    } catch (e) {
      console.error(e);
      const { reason, to_uid: toUid } = e;
      const error: string = reason;

      msg.set('sendError', error);

      if (error.match(/not found/)) {
        this.statusManager.markOffline(toUid)
      }
    }
  // }
  });

  async encryptMessage(payload: any, theirPublicKey: Uint8Array, myPrivateKey: Uint8Array): Promise<string> {
    const payloadString = JSON.stringify(payload);
    const payloadBytes = toUint8Array(payloadString);

    const encryptedMessage = await encryptFor(payloadBytes, theirPublicKey, myPrivateKey);

    return await toBase64(encryptedMessage);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/dispatcher': MessageDispatcher
  }
}
