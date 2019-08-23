import { create, text, clickable, collection } from 'ember-cli-page-object';

export const sidebarContactsPage = create({
  header: {
    scope: '[data-test-sidebar-contacts-header]',
    clickAdd: clickable('[data-test-add-friend]'),
  },
  listText: text('[data-test-contact-row]'),
  list: collection('[data-test-contact-row]', {
    name: text('[data-test-contact-name]'),
  }),
  offlineCount: {
    scope: '[data-test-offline-count]',
  },
});
