import { find, click, fillIn, findAll } from '@ember/test-helpers';
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
  },
  submitButton: {
    scope: '[data-test-chat-submit]',
    isDisabled: is('[disabled]'),
  },
  numberOfMessages: count('[data-test-chat-message]'),
  messages: collection('[data-test-chat-message]', {
    hasLoader: isVisible('.ellipsis-loader'),
    confirmations: {
      scope: '[data-test-confirmations]',
      text: text(),
      hoverTip: text('.hover-tip'),
      delete: clickable('[data-test-delete]'),
      resend: clickable('[data-test-resend]'),
      autosend: clickable('[data-test-autosend]'),
    },
  }),
});

export const chat = {
  selectors,
  textarea: {
    fillIn: (text: string) => fillIn('[data-test-chat-entry]', text),
    isDisabled: () => !!find('[data-test-chat-entry][disabled]'),
  },

  submitButton: {
    click: () => click('[data-test-chat-submit]'),
    isDisabled: () => !!find('[data-test-chat-submit][disabled]'),
  },

  messages: {
    all: () => findAll('[data-test-chat-message]'),
    confirmationsFor: (e: Element) => Array.from(e.querySelectorAll('[data-test-confirmations]')),
    loaderFor: (e: Element) => e.querySelector('.ellipsis-loader'),
  },
};
