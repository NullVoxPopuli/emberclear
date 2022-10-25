import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type LocaleService from 'emberclear/services/locale';

export default class LocaleSwitcher extends Component {
  @service locale!: LocaleService;

  @tracked isActive = false;

  dropdown!: HTMLDivElement;

  options = [
    { locale: 'de-de', label: 'Deutsch' },
    { locale: 'en-us', label: 'English' },
    { locale: 'es-es', label: 'Español' },
    { locale: 'fr-fr', label: 'Français' },
    { locale: 'pt-pt', label: 'Português' },
    { locale: 'ru-ru', label: 'Русский' },
  ];

  get currentLanguage() {
    const current = this.options.find((opt: any) => opt.locale === this.locale.currentLocale);

    if (current) {
      return current.label;
    }

    return this.options[1].label;
  }

  @action
  didInsert(element: HTMLDivElement) {
    this.dropdown = element;
  }

  @action
  toggleMenu() {
    this.isActive = !this.isActive;
  }

  @action
  closeMenu() {
    this.isActive = false;
  }

  @action
  chooseLanguage(locale: string) {
    return this.locale.setLocale(locale);
  }
}
