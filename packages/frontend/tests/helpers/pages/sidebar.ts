import { find, click, triggerKeyEvent, fillIn, findAll } from '@ember/test-helpers';

import { create, clickable, isVisible, text } from 'ember-cli-page-object';

const wrapper = '[data-test-offcanvas-wrapper]';
const toggleButton = '[data-test-hamburger-toggle]';
const sidebarContainer = '[data-test-sidebar-container]';
const channelForm = '[data-test-channel-form]';
const contacts = '[data-test-sidebar-contacts]';

export const page = create({
  scope: '[data-test-offcanvas-wrapper]',
  contacts: {
    scope: '[data-test-sidebar-contacts]',
    clickAdd: clickable('[data-test-add-friend]'),
    offlineCount: {
      scope: '[data-test-offline-count]',
      isVisible: isVisible(),
      text: text(),
    },
  },
});

export const sidebar = {
  selectors: {
    offlineCount: '[data-test-offline-count]',
    contacts,
  },

  wrapper: () => find(wrapper),

  toggle: () => click(`${wrapper} ${sidebarContainer} > ${toggleButton}`),

  isOpen: () => !!find(`${wrapper} .is-sidebar-visible`),
  isPresent: () => !!find(`${wrapper} ${sidebarContainer}`),

  contacts: {
    clickAdd: () => click(`${contacts} [data-test-add-friend]`),
    clickShare: () => click(`${contacts} [data-test-share-info]`),
    rows: () => findAll(`${sidebarContainer} [data-test-contact-row].is-hidden-touch`),
    offlineCount: () => find(`[data-test-offline-count]`),
  },

  channels: {
    toggleForm: () => click('[data-test-channel-form-toggle]'),
    form: () => find(channelForm),
    formInput: () => find(`${channelForm} input`),
    fillInput: (text: string) => fillIn(`${channelForm} input`, text),
    submitForm: () => triggerKeyEvent(`${channelForm} input`, 'keypress', 'Enter'),
  },
};

export default {
  sidebar,
};
