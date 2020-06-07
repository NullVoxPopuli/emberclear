import StoreService from '@ember-data/store';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';

import Message, { TARGET } from 'emberclear/models/message';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';
import CurrentUserService from 'emberclear/services/current-user';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'emberclear/utils/ember-concurrency';

const TIMEOUT_MS = 1000;

interface IArgs {
  message: Message;
}

export default class DeliveryConfirmation extends Component<IArgs> {
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;

  @tracked timedOut = false;

  get wasReceived() {
    return this.args.message.to === this.currentUser.uid;
  }

  get wasSent() {
    return !this.wasReceived;
  }

  get hasDeliveryConfirmations() {
    try {
      let confirmations = this.args.message.deliveryConfirmations;

      if (confirmations) {
        return confirmations.length > 0;
      }
    } catch (e) {
      console.info(e);
    }

    return false;
  }

  @dropTask({ withTestWaiter: true })
  async waitForConfirmation() {
    if (this.timedOut) return;

    await timeout(TIMEOUT_MS);

    if (!this.hasDeliveryConfirmations) {
      this.timedOut = true;
    }
  }

  @dropTask({ withTestWaiter: true })
  async resend() {
    const { message } = this.args;
    let to: Contact | Channel;

    // TODO: make the to a polymorphic relationship
    switch (message.target) {
      case TARGET.WHISPER:
        to = await this.store.findRecord('contact', message.to);
        break;
      case TARGET.CHANNEL:
        to = await this.store.findRecord('channel', message.to);
        break;
      default:
        return;
    }

    this.timedOut = false;

    await this.dispatcher.sendTo(message, to);

    await taskFor(this.waitForConfirmation).perform();
  }

  @dropTask({ withTestWaiter: true })
  async deleteMessage() {
    const { message } = this.args;

    await message.destroyRecord();
  }

  @dropTask({ withTestWaiter: true })
  async resendAutomatically() {
    const { message } = this.args;

    message.queueForResend = true;

    await message.save();
  }

  // TODO: does this have to be redundant? I have to be doing something wrong
  @action
  doDelete() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.deleteMessage).perform();
  }

  @action
  doResend() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.resend).perform();
  }

  @action
  doQueue() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.resendAutomatically).perform();
  }

  @action
  doWait() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.waitForConfirmation).perform();
  }
}
