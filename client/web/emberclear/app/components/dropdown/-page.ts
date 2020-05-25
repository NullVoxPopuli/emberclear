import { create, clickable, hasClass } from 'ember-cli-page-object';

export const definition = {
  scope: '[data-test-dropdown]',
  isOpen: hasClass('active'),
  toggle: clickable('.dropdown-trigger'),
  backdrop: {
    scope: '.full-overlay',
  },
};

export const page = create(definition);
