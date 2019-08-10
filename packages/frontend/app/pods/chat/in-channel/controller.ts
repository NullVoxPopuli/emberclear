import Controller from '@ember/controller';
import { reads } from '@ember/object/computed';

import { TARGET } from 'emberclear/models/message';

export default class extends Controller {
  @reads('model.targetChannel.id') id!: string;

  get messages() {
    return this.store.peekAll('message').filter(message => {
      const target = this.id;

      return message.target === TARGET.CHANNEL && message.to === target;
    });
  }
}
