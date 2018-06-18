import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

import {
  objectToDataURL, toHex, fromHex
} from 'emberclear/src/utils/string-encoding';

import IdentityService from 'emberclear/services/identity/service';

export default class Settings extends Service {
  @service identity!: IdentityService;

  @computed('identity.privateKey', 'identity.publicKey')
  get downloadUrl() {
    const { name, publicKey, privateKey } = this.identity;

    if (!privateKey) return;
    if (!publicKey) return;

    const toDownload = {
      name,
      privateKey:  toHex(privateKey),
      publicKey: toHex(publicKey)
    }

    return objectToDataURL(toDownload);
  }

  import(settings: string) {
    const json = JSON.parse(settings);

    this.identity.setIdentity(
      json.name,
      fromHex(json.privateKey),
      fromHex(json.publicKey)
    );

    // TODO: the actual settings
  }

};


// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'settings': Settings
  }
};
