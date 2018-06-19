import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { alias, reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';
import Settings from 'emberclear/services/settings';

export default class extends Controller {
  @service identity!: IdentityService;
  @service('notifications') flash!: Notifications;
  @service settings!: Settings;

  @alias('identity.record.name') name!: string;

  showPrivateKey = false;

  @reads('settings.downloadUrl') downloadSettingsUrl!: string;

  @action
  async save() {
    await this.identity.record!.save();

    this.flash.success('Identity Updated');
  }

}
