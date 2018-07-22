import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { reads, filter } from '@ember-decorators/object/computed';

import Message, { MESSAGE_TYPE } from 'emberclear/src/data/models/message';
import IdentityService from 'emberclear/services/identity/service';

export default class extends Controller {
  @service identity!: IdentityService;

  @reads('model.targetIdentity.uid') uid!: string;

  @filter('model.messages')
  messages(message: Message, _index: number, _array: Message[]) {
    return (
      message.type === MESSAGE_TYPE.WHISPER && (
        // we sent this message
        (message.to === this.uid && message.from === this.identity.uid)
        // we received a message
        || message.from === this.uid
      )
    );
  }

}
