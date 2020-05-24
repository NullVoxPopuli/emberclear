import { hasClass } from 'ember-cli-page-object';

export const definition = {
  scope: '[data-test-new-messages-available]',
  isHidden: hasClass('hidden'),
};
