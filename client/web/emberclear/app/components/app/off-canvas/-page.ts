import { find } from '@ember/test-helpers';
import { create, clickable, isPresent, fillable, text } from 'ember-cli-page-object';
import { getter } from 'ember-cli-page-object/macros';
import {
  sidebarChannelsPage,
  sidebarContactsPage,
  sidebarActionsPage,
} from 'emberclear/components/app/sidebar/chats/-page';
import { valueOfProperty } from 'emberclear/utils/dom/css';

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
    let element = find('main') as HTMLElement;
    let style = element.getAttribute('style') || '';
    let sidebarWidth = valueOfProperty('sidenav-width');

    return style.includes(sidebarWidth);
  }),

  content: {
    scope: 'main',
  },

  sidebar: {
    scope: 'aside',

    search: fillable('[data-test-sidebar-search]'),
    searchInfo: text('[data-test-search-info]'),

    selectContactsTab: clickable('[data-test-tab-contacts]'),
    selectChannelsTab: clickable('[data-test-tab-channels]'),
    selectActionsTab: clickable('[data-test-tab-actions]'),

    //TODO: turn into single identifier to test which text appears.
    // this can't be done until the old tests are not needed.
    // currently, if these break, it crashes instead of failing.
    contacts: sidebarContactsPage,
    channels: sidebarChannelsPage,
    actions: sidebarActionsPage,

    footer: {
      scope: 'footer',
    },
  },
});
