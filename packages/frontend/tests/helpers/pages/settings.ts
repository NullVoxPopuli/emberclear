import { click, find, fillIn } from '@ember/test-helpers';
import { create, collection, clickable, isVisible, fillable } from 'ember-cli-page-object';

const wrapper = '[data-test-settings-wrapper]';

export const page = create({
  ui: {
    toggleHideOfflineContacts: clickable('[data-test-hide-offline-contacts]'),
  },
  relays: {
    addRelay: clickable('[data-test-add-relay]'),
    form: {
      scope: '[data-test-add-relay-form]',
      isVisible: isVisible(),
      fillSocket: fillable('[data-test-socket-field]'),
      fillOg: fillable('[data-test-og-field]'),
      save: clickable('[data-test-save-relay]'),
    },
    table: {
      rows: collection('[data-test-relays] tbody tr', {
        isConnected: isVisible('[data-test-connected]'),
        remove: clickable('[data-test-remove]'),
        makeDefault: clickable('[data-test-make-default]'),
      }),
    },
  },
  permissions: {
    notifications: {
      scope: '[data-test-notifications]',
      isVisible: isVisible(),
    },
  },
  dangerZone: {
    deleteMessages: {
      scope: '[data-test-delete-messages]',
      click: clickable(),
      isVisible: isVisible(),
    },
  },
  interface: {
    scope: '[data-test-interface]',
    isVisible: isVisible(),
  },
});

export const settings = {
  save: () => click(`${wrapper} [data-test-save]`),
  fillNameField: (text: string) => fillIn(`${wrapper} [data-test-name-field]`, text),

  deleteMessages: () => click(`${wrapper} [data-test-delete-messages]`),

  togglePrivateKey: () => click(`${wrapper} [data-test-show-private-key-toggle]`),

  privateKeyText: () => find(`${wrapper} [data-test-mnemonic]`),

  toggleHideOfflineContacts: () => click(`${wrapper} [data-test-hide-offline-contacts]`),
};

export default {
  settings,
};
