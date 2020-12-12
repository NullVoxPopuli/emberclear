import { clickable, create, fillable } from 'ember-cli-page-object';

export const nameForm = create({
  scope: '[data-test-name-form]',
  clickNext: clickable('[data-test-next]'),
  enterName: fillable(`[data-test-name-field]`),
});

export const completedPage = create({
  selectors: {
    mnemonic: '[data-test-setup-mnemonic]',
  },
  mnemonic: {
    scope: '[data-test-setup-mnemonic]',
  },
  clickNext: clickable(`[data-test-next]`),
});

export const overwritePage = create({
  confirm: clickable('[data-test-overwrite-confirm]'),
  abort: clickable('[data-test-overwrite-abort]'),
});

export default {
  nameForm,
};
