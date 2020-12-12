import { clickable, create, text } from 'ember-cli-page-object';

export const page = create({
  scope: '[data-test-qr-container]',
  text: text(),

  error: {
    scope: '[data-test-error]',
    message: text('[data-test-message]'),
    clickRetry: clickable('[data-test-retry]'),
  },

  scanner: {
    scope: '[data-test-qr-scanner]',
  },

  confirm: {
    scope: '[data-test-login-confirm]',
    code: text('[data-test-code]'),

    clickAllow: clickable('[data-test-allow]'),
    clickDeny: clickable('[data-test-deny]'),
  },

  unknownState: {
    scope: '[data-test-unkown-state]',
  },
});
