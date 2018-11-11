import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';
import { task } from 'ember-concurrency';

import IdentityService from 'emberclear/services/identity/service';
import Settings from 'emberclear/services/settings';

import { convertObjectToQRCodeDataURL } from 'emberclear/src/utils/string-encoding';

export default class SettingsAsQrCode extends Component {
  @service identity!: IdentityService;
  @service settings!: Settings;

  @reads('qrCodeTask.lastSuccessful.value') qrCode!: string;

  qrCodeTask = task(function * (this: SettingsAsQrCode) {
    const settings = yield this.settings.buildSettings();

    if (!settings) return;

    const qrCode = yield convertObjectToQRCodeDataURL(settings);

    return qrCode;
  }).on('didInsertElement');

}
