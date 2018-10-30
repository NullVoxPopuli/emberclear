import Controller from '@ember/controller';
import { reads, filter } from '@ember-decorators/object/computed';

import Message, { TARGET } from 'emberclear/src/data/models/message';

export default class extends Controller {
  @reads('model.targetChannel.id') id!: string;

  @filter('model.messages')
  messages(message: Message, _index: number, _array: Message[]) {
    const target = this.id;

    return message.target === TARGET.CHANNEL && message.to === target;
  }

}
