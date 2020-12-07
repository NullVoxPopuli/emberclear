import Service from '@ember/service';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import { inLocalStorage } from 'emberclear/utils/decorators';

const DEFAULT_LOCALE = 'en-us';

export default class LocaleService extends Service {
  @service declare intl: IntlService;

  @inLocalStorage currentLocale = DEFAULT_LOCALE;

  async setLocale(locale: string = DEFAULT_LOCALE) {
    this.currentLocale = locale || DEFAULT_LOCALE;

    // uncomment for asyncily loaded translations
    // const request = await fetch(`/translations/${locale}.json`);
    // const translations = await request.json();

    // this.intl.addTranslations(locale, translations);
    this.intl.setLocale([locale]);
  }
}
