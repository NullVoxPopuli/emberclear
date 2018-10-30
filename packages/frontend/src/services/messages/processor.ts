import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';
import Identity from 'emberclear/data/models/identity/model';
import StatusManager from 'emberclear/services/status-manager';
import ContactManager from 'emberclear/services/contact-manager';
import ChatScroller from 'emberclear/services/chat-scroller';

import { decryptFrom } from 'emberclear/src/utils/nacl/utils';
import { fromHex, toString, fromBase64 } from 'emberclear/src/utils/string-encoding';

export default class MessageProcessor extends Service {
  @service store!: DS.Store;
  @service identity!: IdentityService;
  @service relayConnection!: RelayConnection;
  @service statusManager!: StatusManager;
  @service contactManager!: ContactManager;
  @service chatScroller!: ChatScroller;

  async receive(socketData: RelayMessage) {
    const { uid, message } = socketData;
    const senderPublicKey = fromHex(uid);
    const recipientPrivateKey = this.identity.privateKey!;

    const decrypted = await this.decryptMessage(message, senderPublicKey, recipientPrivateKey);

    // once received, parse it into a message,
    // and save it. ember-data and the routing
    // will take care of where to place the
    // message in the UI
    await this.importMessage(decrypted);

    this.chatScroller.maybeNudgeToBottom();
  }

  async decryptMessage(message: string, senderPublicKey: Uint8Array, recipientPrivateKey: Uint8Array) {
    const messageBytes = await fromBase64(message);

    const decrypted = await decryptFrom(
      messageBytes, senderPublicKey, recipientPrivateKey
    );

    // TODO: consider a binary format, instead of
    //       converting to/from string and json
    const payload = toString(decrypted);
    const data = JSON.parse(payload);

    return data;
  }

  async importMessage(json: RelayJson) {
    const { type, target, message: msg, sender: senderInfo } = json;

    const sender = await this.findOrCreateSender(senderInfo);

    this.statusManager.markOnline(sender);

    const message = this.store.createRecord('message', {
      type,
      target,
      sender,
      from: sender.uid,
      to: this.identity.uid,
      sentAt: new Date(json.time_sent),
      receivedAt: new Date(),
      body: msg.body,
      channel: msg.channel,
      thread: msg.thread,
      contentType: msg.contentType,
    });

    await message.save();

    return message;
  }

  async findOrCreateSender(senderData: RelayJson["sender"]): Promise<Identity> {
    const { name, uid } = senderData;

    if (uid === this.identity.uid) {
      return this.identity.record!;
    }

    return await this.contactManager.findOrCreate(uid, name);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/processor': MessageProcessor
  }
}
