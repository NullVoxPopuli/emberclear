// import Component from 'sparkles-component';
import Component from '@ember/component';
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

// export default class DeliveryConfirmation extends Component<IArgs> {
export default class DeliveryConfirmation extends Component {
  @service identity!: IdentityService;

  timedOut = false;

  @not('wasReceived') wasSent!: boolean;
  // @notEmpty('args.message.deliveryConfirmations') hasDeliveryConfirmations!: boolean;
  @notEmpty('message.deliveryConfirmations') hasDeliveryConfirmations!: boolean;

  didInsertElement() {
    this.waitForConfirmation.perform();
  }

  // @computed('args.message.to')
  @computed('message.to')
  get wasReceived() {
    // return this.args.message.to === this.identity.uid;
    return this.message.to === this.identity.uid;
  }

  // TODO: ember-concurrency doesn't work with sparkles?
  @dropTask * waitForConfirmation(this: DeliveryConfirmation) {
    if (this.timedOut) return;

    yield timeout(TIMEOUT_MS);

    if (!this.hasDeliveryConfirmations) {
      this.set('timedOut', true);
    }
  }
}
