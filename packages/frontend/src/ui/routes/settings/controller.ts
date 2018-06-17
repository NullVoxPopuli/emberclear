import Controller from '@ember/controller';
import { action, computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import { objectToDataURL } from 'emberclear/src/utils/string-encoding';

import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';

export default class extends Controller {
  @service identity!: IdentityService;
  @service('notifications') flash!: Notifications;

  @alias('identity.record.name') name!: string;

  showPrivateKey = false;

  @computed('identity.record')
  downloadSettingsUrl() {
    const toDownload = {
      name: this.identity.name,
      privateKey: this.identity.privateKey,
      publicKey: this.identity.publicKey
    }

    return objectToDataURL(toDownload);
  }

  @action
  async save() {
    await this.identity.record!.save();

    this.flash.success('Identity Updated');
  }

}
