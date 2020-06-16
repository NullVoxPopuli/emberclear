import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import CurrentUserService from 'emberclear/services/current-user';
import { messagesForDM } from 'emberclear/models/message/utils';

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

    return filteredMessages;
  }
}
