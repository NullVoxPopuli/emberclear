import Component, { tracked } from 'sparkles-component';
import { later } from '@ember/runloop';
import uuid from 'uuid';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';

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
      { locale: 'en-us', label: 'English' },
      { locale: 'de-de', label: 'Deutsche' },
      { locale: 'fr-fr', label: 'Français' },
      { locale: 'es-es', label: 'Español' },
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
