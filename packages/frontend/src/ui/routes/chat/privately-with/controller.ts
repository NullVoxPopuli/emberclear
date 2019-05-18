import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import { TARGET } from 'emberclear/src/data/models/message/model';
import CurrentUserService from 'emberclear/services/current-user/service';

export default class extends Controller {
  @service currentUser!: CurrentUserService;

  get uid() {
    return this.model.targetIdentity.uid;
  }

  get messages() {
    const me = this.currentUser.uid;
    const chattingWithId = this.uid;

    return this.store.peekAll('message').filter(message => {
      const isRelevant =
        message.target === TARGET.WHISPER &&
        // we sent this message to someone else (this could incude ourselves)
        ((message.to === chattingWithId && message.from === me) ||
          // we received a message from someone else to us (including from ourselves)
          (message.from === chattingWithId && message.to === me));

      return isRelevant;
    });
  }
}
