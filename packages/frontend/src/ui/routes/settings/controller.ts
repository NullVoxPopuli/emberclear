import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';

export default class extends Controller {
  @service identity!: IdentityService;
  @service('notifications') flash!: Notifications;

  @alias('identity.record.name') name!: string;

  showPrivateKey = false;

  @action
  async save() {
    await this.identity.record!.save();

    this.flash.success('Identity Updated');
  }

  @action
  async downloadSettings() {
    // console.log('settings')s;
  }
}
