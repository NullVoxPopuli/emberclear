import { find } from '@ember/test-helpers';

import { clickable, create, fillable, isPresent, text } from 'ember-cli-page-object';
import { getter } from 'ember-cli-page-object/macros';

import {
  sidebarActionsPage,
  sidebarChannelsPage,
  sidebarContactsPage,
} from 'emberclear/components/app/sidebar/chats/-page';

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

export const page = create({
  toggle: clickable('.top-nav button.navbar-burger'),
  isPresent: isPresent('aside'),

  isOpen: getter(function () {
    let element = find('.mobile-menu') as HTMLElement;

    return element.classList.contains('mobile-menu--open');
  }),

  content: {
    scope: '#scrollContainer',
  },

  sidebar: {
    scope: 'aside',

    search: fillable('[data-test-sidebar-search]'),
    searchInfo: text('[data-test-search-info]'),

    selectContactsTab: clickable('[data-test-tab-contacts]'),
    selectChannelsTab: clickable('[data-test-tab-channels]'),
    selectActionsTab: clickable('[data-test-tab-actions]'),

    header: {
      scope: '[data-test-sidebar-content-header]',
    },

    contacts: sidebarContactsPage,
    channels: sidebarChannelsPage,
    actions: sidebarActionsPage,

    footer: {
      scope: 'footer',
    },
  },
});
