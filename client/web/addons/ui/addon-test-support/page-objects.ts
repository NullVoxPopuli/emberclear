import { clickable, hasClass, property, text } from 'ember-cli-page-object';

import { keyEvents } from './key-events';

export const switchWrapper = {
  scope: '.switch',

  label: text('label'),

  isChecked: property('checked', 'input'),
  check: clickable('input'),
};

export const switchInput = {
  isChecked: property('checked'),
  check: clickable(),
};

export const modal = {
  ...keyEvents('[data-test-modal-content]'),
  modalContent: {
    scope: '[data-test-modal-content]',
  },
  backdrop: {
    scope: '[data-test-modal-backdrop]',
    click: clickable(),
  },
};

export const dropdown = {
  scope: '[data-test-dropdown]',
  isOpen: hasClass('active'),
  toggle: clickable('.dropdown-trigger'),
  backdrop: {
    scope: '.full-overlay',
  },
};
