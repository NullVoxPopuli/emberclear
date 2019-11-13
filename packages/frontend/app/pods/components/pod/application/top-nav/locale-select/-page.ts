import { create, clickable, collection, text, hasClass } from 'ember-cli-page-object';

export const definition = {
  scope: '[data-test-locale-select]',
  isOpen: hasClass('active'),
  toggle: clickable('[data-test-locale-toggle]'),
  options: collection('.navbar-item', {
    text: text('span'),
  }),
  optionFor(lang: string) {
    return this.options.findOne(option => {
      return option.text === lang;
    });
  },
};

export const page = create(definition);
