import { find } from '@ember/test-helpers';
import { create, clickable, isPresent } from 'ember-cli-page-object';
import { getter } from 'ember-cli-page-object/macros';
import {
  sidebarChannelsPage,
  sidebarContactsPage,
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

    contacts: sidebarContactsPage,
    channels: sidebarChannelsPage,

    footer: {
      scope: 'footer',
    },
  },
});
