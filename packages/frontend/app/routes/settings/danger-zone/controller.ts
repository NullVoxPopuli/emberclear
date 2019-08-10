import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class extends Controller {
  @service toast!: Toast;

  messagesDeleted = false;

  @action
  async deleteMessages() {
    this.toast.info('Deleting messages...');
    this.set('messagesDeleted', true);

    const messages = await this.store.findAll('message');
    await messages.invoke('destroyRecord');

    this.toast.info('All messages have been cleared.');
  }
}
