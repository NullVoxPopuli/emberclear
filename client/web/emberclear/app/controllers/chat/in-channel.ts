import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

import type StoreService from '@ember-data/store';
import { TARGET } from 'emberclear/models/message';

export default class extends Controller {
  @service store!: StoreService;

  get id() {
    return this.model.targetChannel.id;
  }

  get messages() {
    return this.store.peekAll('message').filter((message) => {
      const target = this.id;

      return message.target === TARGET.CHANNEL && message.to === target;
    });
  }
}
