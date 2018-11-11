import {
  find, click, fillIn, findAll,
} from '@ember/test-helpers';

export const chat = {
  selectors: {
    form: '[data-test-chat-entry-form]',
    textarea: '[data-test-chat-entry]',
    message: '[data-test-chat-message]',
    submitButton: '[data-test-chat-submit]',
    confirmations: '[data-test-confirmations]',
  },

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


