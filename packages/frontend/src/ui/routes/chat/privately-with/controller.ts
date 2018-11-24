import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { reads, filter } from '@ember-decorators/object/computed';

import Message, { TARGET } from 'emberclear/src/data/models/message/model';
import IdentityService from 'emberclear/services/identity/service';

export default class extends Controller {
  @service identity!: IdentityService;

  @reads('model.targetIdentity.uid') uid!: string;

  @filter('model.messages')
  messages(message: Message, _index: number, _array: Message[]) {
    const me = this.identity.uid;
    const chattingWithId = this.uid;

    const isRelevant = (
      message.target === TARGET.WHISPER && (
        // we sent this message to someone else (this could incude ourselves)
        (message.to === chattingWithId && message.from === me)
        // we received a message from someone else to us (including from ourselves)
        || (message.from === chattingWithId && message.to === me)
      )
    );

    return isRelevant;
  }

}
