import {
  create,
  collection,
  is,
  count,
  isVisible,
  text,
  fillable,
  clickable,
} from 'ember-cli-page-object';

import { typeIn } from '@ember/test-helpers';

export const selectors = {
  form: '[data-test-chat-entry-form]',
  textarea: '[data-test-chat-entry]',
  message: '[data-test-chat-message]',
  submitButton: '[data-test-chat-submit]',
  confirmations: '[data-test-confirmations]',
};

export const page = create({
  textarea: {
    scope: '[data-test-chat-entry]',
    isDisabled: is('[disabled]'),
    fillIn: fillable(),
    typeIn(substring: string) {
      return typeIn('[data-test-chat-entry]', substring);
    },
  },
  submitButton: {
    scope: '[data-test-chat-submit]',
    isDisabled: is('[disabled]'),
  },
  numberOfMessages: count('[data-test-chat-message]'),
  messages: collection('[data-test-chat-message]', {
    hasLoader: isVisible('.ellipsis-loader'),
    hasCode: isVisible('.token', { multiple: true }),
    confirmations: {
      scope: '[data-test-confirmations]',
      text: text(),
      hoverTip: text('.hover-tip'),
      delete: clickable('[data-test-delete]'),
      resend: clickable('[data-test-resend]'),
      autosend: clickable('[data-test-autosend]'),
      isLoading: isVisible('.ellipsis-loader'),
    },
  }),
});
