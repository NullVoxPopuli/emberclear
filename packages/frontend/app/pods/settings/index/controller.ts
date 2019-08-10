import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import Settings from 'emberclear/services/settings';

export default class ProfileController extends Controller {
  @service currentUser!: CurrentUserService;
  @service('toast') toast!: Toast;
  @service settings!: Settings;

  @alias('currentUser.record.name') name!: string;

  showPrivateKey = false;

  @reads('settings.downloadUrl') downloadSettingsUrl!: string;

  @action
  async save() {
    await this.currentUser.record!.save();

    this.toast.success('Identity Updated');
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
