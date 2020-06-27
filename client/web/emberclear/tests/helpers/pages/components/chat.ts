import { hasClass } from 'ember-cli-page-object';

export const newMessages = {
  scope: '[data-test-new-messages-available]',
  isHidden: hasClass('hidden'),
};
