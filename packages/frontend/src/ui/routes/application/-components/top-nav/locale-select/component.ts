import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import { later } from '@ember/runloop';
import uuid from 'uuid';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

import LocaleService from 'emberclear/src/services/locale';
import { keepInViewPort } from 'emberclear/src/utils/dom/utils';

interface IArgs {}

export default class LocaleSwitcher extends Component<IArgs> {
  @service locale!: LocaleService;

  options: any;
  @tracked isActive = false;
  dropDownId = uuid();

  constructor(args: IArgs) {
    super(args);

    this.options = [
      { locale: 'de-de', label: 'Deutsche' },
      { locale: 'en-us', label: 'English' },
      { locale: 'es-es', label: 'Español' },
      { locale: 'fr-fr', label: 'Français' },
      { locale: 'pt-pt', label: 'Português' },
      { locale: 'ru-ru', label: 'Русский' },
    ];
  }

  @reads('locale.currentLocale') currentLocale!: string;

  @computed('currentLocale')
  get currentLanguage() {
    return this.options.find((opt: any) => opt.locale === this.currentLocale).label;
  }

  get dropDown(): HTMLElement {
    return document.getElementById(this.dropDownId)!;
  }

  toggleMenu() {
    this.isActive = !this.isActive;

    if (this.isActive) {
      later(this, () => keepInViewPort(this.dropDown));
    }
  }

  closeMenu() {
    this.isActive = false;
  }

  chooseLanguage(locale: string) {
    this.locale.setLocale(locale);
  }
}
