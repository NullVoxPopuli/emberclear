import { clickable, text, fillable } from 'ember-cli-page-object';
import { click } from '@ember/test-helpers';

import { modal } from '@emberclear/ui/test-support/page-objects';

export const definition = {
  scope: '[data-test-embeds-snippet-modal]',
  ...modal,

  title: text('h5'),
  fillInTitle: fillable('input'),
  fillInCode: fillable('textarea'),
  selectLanguage(language: string) {
    let scope = this.scope;

    let select = document.querySelector(`${scope} select`)!;
    let options = select.querySelectorAll('option')!;

    let option = Array.from(options).find((option) => {
      return option.textContent!.toLowerCase().includes(language.toLowerCase());
    });

    if (!option) {
      throw new Error(`Option for text \`${language}\` not found`);
    }

    return click(option);
  },

  cancel: clickable('[data-test-cancel]'),
  submit: clickable('[data-test-submit]'),
};
