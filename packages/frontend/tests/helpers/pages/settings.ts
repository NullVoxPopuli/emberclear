import { click, find, fillIn } from '@ember/test-helpers';

const wrapper = '[data-test-settings-wrapper]';

export const settings = {
  save: () => click(`${wrapper} [data-test-save]`),
  fillNameField: (text: string) => fillIn(`${wrapper} [data-test-name-field]`, text),

  deleteMessages: () => click(`${wrapper} [data-test-delete-messages]`),

  togglePrivateKey: () => click(`${wrapper} [data-test-show-private-key-toggle]`),

  privateKeyText: () => find(`${wrapper} [data-test-mnemonic]`),

  toggleHideOfflineContacts: () => click(`${wrapper} [data-test-hide-offline-contacts]`),
};

export default {
  settings
};
