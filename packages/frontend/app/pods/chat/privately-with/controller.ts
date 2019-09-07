import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import { TARGET, TYPE } from 'emberclear/models/message';
import CurrentUserService from 'emberclear/services/current-user';

export default class extends Controller {
  @service currentUser!: CurrentUserService;

  get uid() {
    return this.model.targetIdentity.uid;
  }

  get messages() {
    let me = this.currentUser.uid;
    let chattingWithId = this.uid;

    let messages = this.store.peekAll('message').filter(message => {
      const isRelevant =
        message.target === TARGET.WHISPER &&
        message.type === TYPE.CHAT &&
        // we sent this message to someone else (this could incude ourselves)
        ((message.to === chattingWithId && message.from === me) ||
          // we received a message from someone else to us (including from ourselves)
          (message.from === chattingWithId && message.to === me));

      return isRelevant;
    });

    return messages;
  }
}
