import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type CurrentUserService from 'emberclear/services/current-user';
import type StoreService from '@ember-data/store';

export default class DangerSettings extends Component {
  @service declare store: StoreService;
  @service declare toast: Toast;
  @service declare currentUser: CurrentUserService;

  @tracked showPrivateKey = false;
  // TODO: should this actually check existence of messages?
  @tracked messagesDeleted = false;

  @action
  togglePrivateKey() {
    this.showPrivateKey = !this.showPrivateKey;
  }

  @action
  async deleteMessages() {
    this.toast.info('Deleting messages...');
    this.messagesDeleted = true;

    const messages = await this.store.findAll('message');

    await messages.invoke('destroyRecord');

    this.toast.info('All messages have been cleared.');
  }
}
