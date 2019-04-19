import { triggerKeyEvent } from '@ember/test-helpers';

import { create, clickable, isVisible, text, collection, fillable } from 'ember-cli-page-object';
import { waitUntilTruthy } from '../waitUntilTruthy';

const wrapper = '[data-test-offcanvas-wrapper]';
const toggleButton = '[data-test-hamburger-toggle]';
const sidebarContainer = '[data-test-sidebar-container]';
const channelForm = '[data-test-channel-form]';
const contacts = '[data-test-sidebar-contacts-list]';
const offlineCount = '[data-test-offline-count]';

export const selectors = {
  wrapper,
  toggleButton,
  sidebarContainer,
  channelForm,
  contacts,
  offlineCount,
};

export const openSidebar = async () => {
  await page.toggle();
  await waitUntilTruthy(() => page.isOpen);
};

export const page = create({
  scope: '[data-test-offcanvas-wrapper]',
  toggle: clickable(`${sidebarContainer} ${toggleButton}`),
  isPresent: isVisible('[data-test-sidebar-container]'),
  isOpen: isVisible('[data-test-sidebar-container].is-sidebar-visible'),
  contacts: {
    header: {
      scope: '[data-test-sidebar-contacts-header]',
      clickAdd: clickable('[data-test-add-friend]'),
    },
    listText: text('[data-test-contact-row]'),
    list: collection('[data-test-sidebar-contacts-list] [data-test-contact-row]', {
      name: text('[data-test-contact-name]'),
    }),
    offlineCount: {
      scope: '[data-test-offline-count]',
    },
  },
  channels: {
    toggleForm: clickable('[data-test-channel-form-toggle]'),
    form: {
      scope: channelForm,
      fill: fillable('input'),
      submit: () => triggerKeyEvent(`${channelForm} input`, 'keypress', 'Enter'),
    },
  },
});
