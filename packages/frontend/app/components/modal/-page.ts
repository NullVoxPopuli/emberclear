import { create, clickable } from 'ember-cli-page-object';
import { keyEvents } from 'emberclear/tests/helpers/pages/-key-events';

export const definition = {
  ...keyEvents('[data-test-modal]'),
  modalContent: {
    scope: '[data-test-modal-content]',
  },
  backdrop: {
    scope: '[data-test-modal-backdrop]',
    click: clickable(),
  },
};

export const page = create(definition);
