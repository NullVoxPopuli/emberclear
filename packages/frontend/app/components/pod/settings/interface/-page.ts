import { create } from 'ember-cli-page-object';

import { inputDefinition } from 'lib/ui/addon/components/ui/switch/-page';

export const definition = {
  scope: '[data-test-interface]',
  hideOfflineContacts: {
    scope: '[data-test-hide-offline-contacts]',
    ...inputDefinition,
  },
  themes: {
    selectMidnight: {
      scope: '[data-test-theme-midnight]',
      ...inputDefinition,
    },
  },
};

export const page = create(definition);
