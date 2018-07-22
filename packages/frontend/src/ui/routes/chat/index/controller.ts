import Controller from '@ember/controller';
import { filter } from '@ember-decorators/object/computed';

import Message, { MESSAGE_TYPE } from 'emberclear/src/data/models/message';

export default class extends Controller {

  @filter('model.messages')
  messages(message: Message, _index: number, _array: Message[]) {
    return message.type === MESSAGE_TYPE.CHAT;
  }

}
