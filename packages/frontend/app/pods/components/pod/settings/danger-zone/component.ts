import Component from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

export default class DangerSettings extends Component {
  @service toast!: Toast;
  @service currentUser!: CurrentUserService;

  @tracked showPrivateKey = false;
  // TODO: should this actually check existence of messages?
  @tracked messagesDeleted = false;

  @action
  async deleteMessages() {
    this.toast.info('Deleting messages...');
    this.set('messagesDeleted', true);

    const messages = await this.store.findAll('message');
    await messages.invoke('destroyRecord');

    this.toast.info('All messages have been cleared.');
  }
}
