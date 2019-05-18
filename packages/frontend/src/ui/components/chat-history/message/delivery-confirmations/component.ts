import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { not, notEmpty } from '@ember/object/computed';
import { task, timeout } from 'ember-concurrency';

import Message, { TARGET } from 'emberclear/src/data/models/message/model';
import Identity from 'emberclear/src/data/models/identity/model';
import Channel from 'emberclear/src/data/models/channel';
import IdentityService from 'emberclear/src/services/identity/service';
import MessageDispatcher from 'emberclear/src/services/messages/dispatcher';

const TIMEOUT_MS = 1000;

interface IArgs {
  message: Message;
}

export default class DeliveryConfirmation extends Component<IArgs> {
  @service identity!: IdentityService;
  @service store;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;

  @tracked timedOut = false;

  @not('wasReceived') wasSent!: boolean;
  @notEmpty('args.message.deliveryConfirmations') hasDeliveryConfirmations!: boolean;

  // @computed('args.message.to')
  get wasReceived() {
    return this.args.message.to === this.identity.uid;
  }

  didInsertElement() {
    this.waitForConfirmation.perform();
  }

  @(task(function*() {
    if (this.timedOut) return;

    yield timeout(TIMEOUT_MS);

    if (!this.hasDeliveryConfirmations) {
      this.timedOut = true;
    }
  }).drop())
  waitForConfirmation;

  @(task(function*() {
    const { message } = this.args;
    let to: Identity | Channel;

    // TODO: make the to a polymorphic relationship
    switch (message.target) {
      case TARGET.WHISPER:
        to = yield this.store.findRecord('identity', message.to);
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
  resend;

  @(task(function*() {
    const { message } = this.args;

    yield message.destroyRecord();
  }).drop())
  deleteMessage;

  @(task(function*() {
    const { message } = this.args;

    message.set('queueForResend', true);
    yield message.save();
  }).drop())
  resendAutomatically;
}
