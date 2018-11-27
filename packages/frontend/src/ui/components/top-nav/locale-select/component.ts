import Component, { tracked } from 'sparkles-component';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';

import LocaleService from 'emberclear/src/services/locale';

interface IArgs {}

export default class LocaleSwitcher extends Component<IArgs> {
  @service locale!: LocaleService;

  options: any;
  @tracked isActive = false;

  constructor(args: IArgs) {
    super(args);

    this.options = [
      { locale: 'en-us', label: 'English' },
      { locale: 'de-de', label: 'Deutsche' },
      { locale: 'fr-fr', label: 'Français' },
      { locale: 'es-es', label: 'Español' },
    ];
  }

  @reads('locale.currentLocale') currentLocale!: string;

  @computed('currentLocale')
  get currentLanguage() {
    return this.options
      .find(( opt: any ) => opt.locale === this.currentLocale)
      .label;
  }

  toggleMenu() {
    this.isActive = !this.isActive;
  }

  closeMenu() {
    this.isActive = false;
  }

  chooseLanguage(locale: string) {
    this.locale.setLocale(locale);
  }
}
