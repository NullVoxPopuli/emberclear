import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import Contact from 'emberclear/models/contact';
import User from 'emberclear/models/user';

import { toHex } from '@emberclear/encoding/string';

import { build as toPayloadJson } from './-utils/builder';

import type StoreService from '@ember-data/store';
import type { CurrentUserService } from '@emberclear/local-account';
import type Channel from 'emberclear/models/channel';
import type Message from 'emberclear/models/message';
import type ConnectionService from 'emberclear/services/connection';
import type MessageFactory from 'emberclear/services/messages/factory';
import type Notifications from 'emberclear/services/notifications';
import type StatusManager from 'emberclear/services/status-manager';

export default class MessageDispatcher extends Service {
  @service declare notifications: Notifications;
  @service declare store: StoreService;
  @service declare connection: ConnectionService;
  @service declare currentUser: CurrentUserService;
  @service declare statusManager: StatusManager;
  @service('messages/factory') declare messageFactory: MessageFactory;

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
      return await taskFor(this.sendToUser).perform(message, to);
    }

    // Otherwise, Channel Message
    return this.sendToChannel(message, to);
  }

  async pingAll() {
    const ping = this.messageFactory.buildPing();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.sendToAll).perform(ping);
  }

  // the downside to end-to-end encryption
  // the bigger the list of identities, the longer this takes
  //
  // TODO: should this be hard-limited to just messages like PINGs?
  @task
  async sendToAll(msg: Message) {
    const everyone = await this.store.findAll('contact');

    everyone.forEach((contact: Contact) => {
      return taskFor(this.sendToUser).perform(msg, contact);
    });
  }

  sendToChannel(msg: Message, channel: Channel) {
    const members = channel.contextChain.members;

    members.forEach((member) => {
      if (member.id === this.currentUser.id) return; // don't send to self

      return taskFor(this.sendToUser).perform(msg, member);
    });
  }

  @task
  async sendToUser(msg: Message, to: Contact) {
    if (!this.currentUser.crypto) {
      console.info('Crypto Worker not available');

      return;
    }

    const theirPublicKey = to.publicKey as Uint8Array;
    const uid = toHex(theirPublicKey);

    const payload = toPayloadJson(msg, this.currentUser.record!);

    const encryptedMessage = await this.currentUser.crypto.encryptForSocket(payload, to);

    try {
      await this.connection.send({ to: uid, message: encryptedMessage });

      msg.receivedAt = new Date();
    } catch (e) {
      const { reason, to_uid: toUid } = e;

      if (reason) {
        const error: string = reason;

        msg.sendError = error;

        if (error.match(/not found/)) {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.statusManager.markOffline(toUid);

          return;
        } else if (error.match(/timed out/)) {
          return;
        }
      }

      console.debug(e.name, e);
    }
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/dispatcher': MessageDispatcher;
  }
}
