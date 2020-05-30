import { create, collection, fillable } from 'ember-cli-page-object';
import { keyEvents } from '@emberclear/ui/test-support/key-events';

const selector = '[data-test-search-modal]';

export const page = create({
  ...keyEvents(selector),
  input: {
    scope: `${selector} input`,
    fillIn: fillable(),
  },
  results: {
    scope: `${selector} .results`,

    contacts: {
      scope: '[data-test-contacts-results]',
      links: collection('a', {}),
    },
    channels: {
      scope: '[data-test-channels-results]',
      links: collection('a', {}),
    },
  },
});
