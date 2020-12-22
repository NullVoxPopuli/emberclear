import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import { MESSAGE_LIMIT } from 'emberclear/models/message';
import { messagesForDM } from 'emberclear/models/message/utils';

import type StoreService from '@ember-data/store';
import type { CurrentUserService } from '@emberclear/local-account';

export default class extends Controller {
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;

  get uid() {
    return this.model.targetIdentity.uid;
  }

  get messages() {
    let allMessages = this.store.peekAll('message');
    let me = this.currentUser.uid;
    let chattingWithId = this.uid;
    let filteredMessages = messagesForDM(allMessages, me, chattingWithId);
    let mostRecent = filteredMessages.slice(0 - MESSAGE_LIMIT);

    return mostRecent;
  }
}
