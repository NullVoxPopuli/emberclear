import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';

import Identity from 'emberclear/services/identity/service';
import { convertObjectToQRCodeDataURL, toHex } from 'emberclear/src/utils/string-encoding';
import { PromiseProxy } from 'emberclear/src/utils/promise';

export default class InviteModal extends Component {
  @service identity!: Identity;

  copied = false;

  @computed('identity.publicKey', 'identity.name')
  get publicIdentity() {
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
  get qrCode() {
    const publicIdentity = this.publicIdentity;
    const qrCodePromise = convertObjectToQRCodeDataURL(publicIdentity);

    return PromiseProxy.create({ promise: qrCodePromise });
  }

  @action
  copySuccess(this: InviteModal) {
    this.set('copied', true);

    setTimeout(() => this.set('copied', false), 2000);
  }

}
