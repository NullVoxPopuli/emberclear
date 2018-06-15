import IntlService from 'ember-intl/services/intl';
import fetch from 'fetch';
import { service } from '@ember-decorators/service';

import config from 'emberclear/config/environment';

export default class EmberclearIntl extends IntlService {
  @service fastboot!: FastBoot;

  async loadTranslations(locale: string) {
    let url = `/translations/${locale}.json`;

    if (this.fastboot.isFastBoot) url = `http://localhost:7784${url}`;

    let response = await fetch(url);
    let translations = await response.json();

    this.addTranslations(locale, translations);
  }

  lookup(key: string, localeName: string, options: any = {}) {
    const localeNames = this.localeWithDefault(localeName);
    const translation = this._adapter.lookup(localeNames, key);

    if (!options.resilient && translation === undefined) {
      const missingMessage = this._owner.resolveRegistration('util:intl/missing-message');

      return missingMessage.call(this, key, [localeNames]);
    }

    return translation;
  }
};


// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'intl': EmberclearIntl
  }
};
