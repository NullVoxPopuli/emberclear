import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import IntlService from 'ember-intl/services/intl';

import { syncToLocalStorage } from 'emberclear/src/utils/decorators';

const DEFAULT_LOCALE = 'en-us';

export default class LocaleService extends Service {
  @service intl!: IntlService;

  @syncToLocalStorage // currentLocale;
  get currentLocale() {
    return DEFAULT_LOCALE;
  }

  async setLocale(locale: string = DEFAULT_LOCALE) {
    this.set('currentLocale', locale);

    // uncomment for asyncily loaded translations
    // const request = await fetch(`/translations/${locale}.json`);
    // const translations = await request.json();

    // this.intl.addTranslations(locale, translations);
    this.intl.setLocale([locale]);
  }
}
