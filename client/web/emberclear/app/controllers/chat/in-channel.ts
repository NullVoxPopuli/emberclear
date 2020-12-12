import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import { TARGET } from 'emberclear/models/message';

import type StoreService from '@ember-data/store';

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
