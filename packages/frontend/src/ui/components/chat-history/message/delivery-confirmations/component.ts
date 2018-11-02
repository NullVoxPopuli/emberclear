import Component, { tracked } from 'sparkles-component';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { not, notEmpty } from '@ember-decorators/object/computed';
import { dropTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';

import Message from 'emberclear/src/data/models/message';
import IdentityService from 'emberclear/src/services/identity/service';

const TIMEOUT_MS = 1000;

interface IArgs {
  message: Message;
}

export default class DeliveryConfirmation extends Component<IArgs> {
  @service identity!: IdentityService;

  @tracked timedOut = false;

  @not('wasReceived') wasSent!: boolean;
  @notEmpty('args.message.deliveryConfirmations') hasDeliveryConfirmations!: boolean;

  @computed('args.message.to')
  get wasReceived() {
    return this.args.message.to === this.identity.uid;
  }

  didInsertElement() {
    this.waitForConfirmation.perform();
  }

  @dropTask * waitForConfirmation(this: DeliveryConfirmation) {
    if (this.timedOut) return;

    yield timeout(TIMEOUT_MS);

    if (!this.hasDeliveryConfirmations) {
      this.timedOut = true;
    }
  }
}
