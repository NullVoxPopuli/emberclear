import { create } from 'ember-cli-page-object';

import { switchInput } from '@emberclear/ui/test-support/page-objects';

export const definition = {
  scope: '[data-test-interface]',
  hideOfflineContacts: {
    scope: '[data-test-hide-offline-contacts]',
    ...switchInput,
  },
  themes: {
    selectMidnight: {
      scope: '[data-test-theme-midnight]',
      ...switchInput,
    },
  },
};

export const page = create(definition);
