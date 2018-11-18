import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { alias, reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import Settings from 'emberclear/services/settings';

export default class extends Controller {
  @service identity!: IdentityService;
  @service('toast') toast!: Toast;
  @service settings!: Settings;

  @alias('identity.record.name') name!: string;

  showPrivateKey = false;
  messagesDeleted = false;

  @reads('settings.downloadUrl') downloadSettingsUrl!: string;
  @alias('settings.hideOfflineContacts') hideOfflineContacts!: boolean;

  @action
  async save() {
    await this.identity.record!.save();

    this.toast.success('Identity Updated');
  }

  @action
  async deleteMessages() {
    this.toast.info('Deleting messages...');
    this.set('messagesDeleted', true);

    const messages = await this.store.findAll('message');
    await messages.invoke('destroyRecord');

    this.toast.info('All messages have been cleared.');

  }

  @action
  async downloadSettings() {
    const settings = await this.settings.buildData();

    if (!settings) return;

    const link = document.createElement('a');
    link.setAttribute('download', 'emberclear.settings');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener');
    link.setAttribute('href', settings);

    link.click();
  }

}
