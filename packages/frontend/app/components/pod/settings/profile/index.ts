import Component from '@glimmer/component';
import { action } from '@ember/object';
import { alias, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import Settings from 'emberclear/services/settings';
import TransferToDevice from 'emberclear/services/current-user/transfer-to-device';

export default class ProfileSettings extends Component {
  @service currentUser!: CurrentUserService;
  @service('toast') toast!: Toast;
  @service settings!: Settings;
  @service('current-user/transfer-to-device') transfer!: TransferToDevice;

  @alias('currentUser.record.name') name!: string;

  @reads('settings.downloadUrl') downloadSettingsUrl!: string;

  @action
  async save(e: Event) {
    e.preventDefault();

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
