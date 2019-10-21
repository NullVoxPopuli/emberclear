import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';
import { parseLanguages } from 'emberclear/utils/string/utils';
import { later } from '@ember/runloop';

import PrismManager from 'emberclear/services/prism-manager';

interface Args {
  positional: [string];
  named: { [key: string]: unknown };
}

export default class FormatCode extends Modifier<Args> {
  @service prismManager!: PrismManager;

  didInstall() {
    let text = this.args.positional[0];

    // extra code features
    this.makeCodeBlocksFancy();

    // non-blocking
    this.addLanguages(text);
  }

  private makeCodeBlocksFancy() {
    if (!this.element) return;

    const pres = this.element.querySelectorAll('pre');

    if (pres?.length > 0) {
      pres.forEach((p) => p.classList.add('line-numbers'));
    }
  }

  private async addLanguages(text: string) {
    const languages = parseLanguages(text);

    languages.forEach((language) => {
      (later as any)(this, () => {
        (this.prismManager.addLanguage as TODO).perform(language, this.element);
      });
    });
  }
}
