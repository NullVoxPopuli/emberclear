import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import Identity from 'emberclear/services/identity/service';
import { convertObjectToQRCodeDataURL, toBase64 } from 'emberclear/src/utils/string-encoding';

export default class Invite extends Component {
  @service identity!: Identity;

  qrCode?: string;

  constructor() {
    super(...arguments);

    this.generateQRCode();
  }

  @computed('identity.publicKey', 'identity.name')
  get publicIdentity() {
    const json = {
      name: this.identity.name,
      publicKey: toBase64(this.identity.publicKey as Uint8Array)
    };

    return json;
  }

  @computed('publicIdentity')
  get identityJson() {
    return JSON.stringify(this.publicIdentity, null, 2);
  }

  // @computed('publicIdentity')
  async generateQRCode(this: Invite) {
    const dataUrl = await convertObjectToQRCodeDataURL(this.publicIdentity);

    this.set('qrCode', dataUrl);
  }
}
