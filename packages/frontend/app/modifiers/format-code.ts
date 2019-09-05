import Modifier from 'ember-oo-modifiers';
import { inject as service } from '@ember/service';
import { parseLanguages } from 'emberclear/utils/string/utils';

import PrismManager from 'emberclear/services/prism-manager';

export default class FormatCode extends Modifier {
  @service prismManager!: PrismManager;

  didInsertElement(text: string) {
    // extra code features
    this.makeCodeBlocksFancy();

    // non-blocking
    this.addLanguages(text);
  }

  private makeCodeBlocksFancy() {
    const pres = this.element.querySelectorAll('pre');

    if (pres && pres.length > 0) {
      pres.forEach(p => p.classList.add('line-numbers'));
    }
  }

  private async addLanguages(text: string) {
    const languages = parseLanguages(text);

    languages.forEach(language => {
      this.prismManager.addLanguage.perform(language, this.element);
    });
  }
}
