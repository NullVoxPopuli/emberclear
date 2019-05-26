import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { once } from '@ember/runloop';
import uuid from 'uuid';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

import LocaleService from 'emberclear/src/services/locale';
import { keepInViewPort } from 'emberclear/src/utils/dom/utils';

interface IArgs {}

export default class LocaleSwitcher extends Component<IArgs> {
  @service locale!: LocaleService;

  @tracked isActive = false;
  dropDownId = uuid();

  options = [
    { locale: 'de-de', label: 'Deutsche' },
    { locale: 'en-us', label: 'English' },
    { locale: 'es-es', label: 'Español' },
    { locale: 'fr-fr', label: 'Français' },
    { locale: 'pt-pt', label: 'Português' },
    { locale: 'ru-ru', label: 'Русский' },
  ];

  @reads('locale.currentLocale') currentLocale!: string;

  @computed('currentLocale')
  get currentLanguage() {
    const current = this.options.find((opt: any) => opt.locale === this.currentLocale);
    if (current) {
      return current.label;
    }

    return this.options[1].label;
  }

  get dropDown(): HTMLElement {
    return document.getElementById(this.dropDownId)!;
  }

  toggleMenu() {
    this.isActive = !this.isActive;

    if (this.isActive) {
      once(this, () => keepInViewPort(this.dropDown));
    }
  }

  closeMenu() {
    this.isActive = false;
  }

  chooseLanguage(locale: string) {
    this.locale.setLocale(locale);
  }
}
