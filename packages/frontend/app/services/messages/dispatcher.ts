import StoreService from 'ember-data/store';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

// giant block o' types
import CurrentUserService from 'emberclear/services/current-user';

import Notifications from 'emberclear/services/notifications';
import Message from 'emberclear/models/message';
import Channel from 'emberclear/models/channel';
import StatusManager from 'emberclear/services/status-manager';
import MessageFactory from 'emberclear/services/messages/factory';

import { toHex } from 'emberclear/utils/string-encoding';
import { build as toPayloadJson } from './-utils/builder';
import { encryptForSocket } from './-utils/encryptor';
import Task from 'ember-concurrency/task';
import Contact from 'emberclear/models/contact';
import User from 'emberclear/models/user';
import ConnectionService from 'emberclear/services/connection';

export default class MessageDispatcher extends Service {
  @service notifications!: Notifications;
  @service store!: StoreService;
  @service connection!: ConnectionService;
  @service currentUser!: CurrentUserService;
  @service statusManager!: StatusManager;
  @service('messages/factory') messageFactory!: MessageFactory;

  async send(text: string, to: Contact | Channel) {
    const message = this.messageFactory.buildChat(text, to);

    await message.save();

    await this.sendTo(message, to);
  }

  // there needs to be a polymorphic relationship in order for this to work
  // sendMessage(message: Message) {
  //   return sendTo(message, message.to);
  // }

  async sendTo(message: Message, to: Contact | Channel) {
    message.queueForResend = false;

    if (to instanceof User) {
      return;
    }

    if (to instanceof Contact) {
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
  @task(function*(this: MessageDispatcher, msg: Message) {
    const everyone = yield this.store.findAll('contact');

    everyone.forEach((contact: Contact) => {
      this.sendToUser.perform(msg, contact);
    });
  })
  sendToAll!: Task;

  sendToChannel(msg: Message, channel: Channel) {
    const members = channel.members;

    members.forEach(member => {
      if (member.id === this.currentUser.id) return; // don't send to self

      this.sendToUser.perform(msg, member);
    });
  }

  @task(function*(this: MessageDispatcher, msg: Message, to: Contact) {
    const theirPublicKey = to.publicKey as Uint8Array;
    const uid = toHex(theirPublicKey);

    const payload = toPayloadJson(msg, this.currentUser.record!);

    const encryptedMessage = yield encryptForSocket(payload, to, this.currentUser.record!);

    try {
      yield this.connection.send({ to: uid, message: encryptedMessage });

      msg.receivedAt = new Date();
    } catch (e) {
      const { reason, to_uid: toUid } = e;

      if (reason) {
        const error: string = reason;

        msg.sendError = error;

        if (error.match(/not found/)) {
          this.statusManager.markOffline(toUid);
          return;
        } else if (error.match(/timed out/)) {
          return;
        }
      }

      console.debug(e.name, e);
    }
  })
  sendToUser!: Task;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/dispatcher': MessageDispatcher;
  }
}
