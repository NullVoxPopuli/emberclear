import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';

// giant block o' types
import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';
import Message from 'emberclear/data/models/message';
import Identity from 'emberclear/src/data/models/identity/model';
import Channel from 'emberclear/src/data/models/channel';
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

  async send(text: string, to: Identity | Channel) {
    const message = this.messageFactory.buildChat(text, to);

    await message.save();

    if (to instanceof Identity) {
      if (to.id === 'me') return;

      return await this.sendToUser.perform(message, to);
    }

    // Otherwise, Channel Message
    return this.sendToChannel(message, to);
  }

  async pingAll() {
    const ping = this.messageFactory.buildPing();

    this.sendToAll.perform(ping);
  }

  // the downside to end-to-end encryption
  // the bigger the list of identities, the longer this takes
  //
  // TODO: should this be hard-limited to just messages like PINGs?
  @task * sendToAll(this: MessageDispatcher, msg: Message) {
    const everyone = yield this.store.findAll('identity');

    everyone.forEach(( identity: Identity ) => {
      if (identity.id === 'me') return; // don't send to self

      this.sendToUser.perform(msg, identity);
    });
  }

  sendToChannel(msg: Message, channel: Channel) {
    const members = channel.members;

    members.forEach(member => {
      if (member.id === this.identity.id) return; // don't send to self

      this.sendToUser.perform(msg, member);
    });
  }

  @task * sendToUser(msg: Message, to: Identity) {
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
        this.statusManager.markOffline(toUid);
      }
    }
  }

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
