import { triggerKeyEvent } from '@ember/test-helpers';
import { create, text, clickable, collection, fillable } from 'ember-cli-page-object';

export const sidebarContactsPage = create({
  header: {
    scope: '[data-test-sidebar-contacts-header]',
    clickAdd: clickable('[data-test-add-friend]'),
  },
  listText: text('[data-test-contacts-list]'),
  list: collection('[data-test-contact-row]', {
    name: text('[data-test-contact-name]'),
    pin: clickable('[data-test-contact-pin]'),
  }),
  offlineCount: {
    scope: '[data-test-offline-count]',
  },
});

const channelForm = '[data-test-channel-form]';

export const sidebarChannelsPage = create({
  header: {
    scope: '[data-test-sidebar-channels-header]',
  },
  listText: text('[data-test-channels-list]'),
  list: collection('[data-test-channel-row]', {
    name: text('[data-test-channel-name]'),
  }),
  toggleForm: clickable('[data-test-channel-form-toggle]'),
  form: {
    scope: channelForm,
    fill: fillable('input'),
    submit: () => triggerKeyEvent(`${channelForm} input`, 'keypress', 'Enter'),
  },
});

export const sidebarActionsPage = create({
  header: {
    scope: '[data-test-sidebar-actions-header]',
  },
  listText: text('[data-test-actions-list]'),
  list: collection('[data-test-action-row]', {
    name: text('[data-test-action-name]'),
    yes: text('[data-test-action-name]'),
    no: text('[data-test-action-name]'),
    dismiss: text('[data-test-action-name]'),
  }),
});