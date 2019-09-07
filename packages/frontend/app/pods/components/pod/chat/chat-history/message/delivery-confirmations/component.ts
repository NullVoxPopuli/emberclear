import StoreService from 'ember-data/store';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

import Message, { TARGET } from 'emberclear/models/message';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';
import CurrentUserService from 'emberclear/services/current-user';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import Task from 'ember-concurrency/task';

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
  }

  @(task(function*(this: DeliveryConfirmation) {
    if (this.timedOut) return;

    yield timeout(TIMEOUT_MS);

    if (!this.hasDeliveryConfirmations) {
      this.timedOut = true;
    }
  }).drop())
  waitForConfirmation!: Task;

  @(task(function*(this: DeliveryConfirmation) {
    const { message } = this.args;
    let to: Contact | Channel;

    // TODO: make the to a polymorphic relationship
    switch (message.target) {
      case TARGET.WHISPER:
        to = yield this.store.findRecord('contact', message.to);
        break;
      case TARGET.CHANNEL:
        to = yield this.store.findRecord('channel', message.to);
        break;
      default:
        return;
    }

    this.timedOut = false;

    yield this.dispatcher.sendTo(message, to);

    yield this.waitForConfirmation.perform();
  }).drop())
  resend!: Task;

  @(task(function*(this: DeliveryConfirmation) {
    const { message } = this.args;

    yield message.destroyRecord();
  }).drop())
  deleteMessage!: Task;

  @(task(function*(this: DeliveryConfirmation) {
    const { message } = this.args;

    message.set('queueForResend', true);
    yield message.save();
  }).drop().withTestWaiter())
  resendAutomatically!: Task;
}
