import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { PromiseMonitor } from 'ember-computed-promise-monitor';

import ENV from '../../../../config/environment';

import Identity from 'emberclear/services/identity/service';
import { disableInFastboot } from 'emberclear/src/utils/decorators';

import { convertObjectToQRCodeDataURL, toHex } from 'emberclear/src/utils/string-encoding';

export default class ShowMyInfo extends Component {
  @service identity!: Identity;

  copied = false;
  showQrCodeMobile = true;

  @alias('identity.isLoggedIn') isLoggedIn!: boolean;

  @computed('identity.publicKey', 'identity.name', 'isLoggedIn')
  get publicIdentity() {
    if (!this.isLoggedIn) return {};

    return {
      name: this.identity.name,
      publicKey: toHex(this.identity.publicKey as Uint8Array)
    };
  }

  @computed('publicIdentity')
  get identityJson() {
    return JSON.stringify(this.publicIdentity, null, 2);
  }

  @computed('publicIdentity')
  get url() {
    const { name, publicKey } = this.publicIdentity;
    const uri = `${ENV.host}/invite?name=${name}&publicKey=${publicKey}`;

    return encodeURI(uri);
  }

  @computed('publicIdentity')
  @disableInFastboot({ default: {} })
  get qrCode() {
    const publicIdentity = this.publicIdentity;
    const qrCodePromise = convertObjectToQRCodeDataURL(publicIdentity);

    return new PromiseMonitor<string>(qrCodePromise);
  }

  @action
  toggleShowQrCode(this: ShowMyInfo) {
    this.set('showQrCodeMobile', !this.showQrCodeMobile);
  }

  @action
  copySuccess(this: ShowMyInfo, e: any) {
    e.clearSelection();
    this.set('copied', true);

    setTimeout(() => this.set('copied', false), 2000);
  }

}
