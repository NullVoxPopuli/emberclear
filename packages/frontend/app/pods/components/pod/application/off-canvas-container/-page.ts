import { find } from '@ember/test-helpers';
import { create, clickable, isPresent } from 'ember-cli-page-object';
import { getter } from 'ember-cli-page-object/macros';
import { sidebarContactsPage } from 'emberclear/pods/components/pod/application/off-canvas-container/sidebar/contacts/-page';
import { sidebarChannelsPage } from 'emberclear/pods/components/pod/application/off-canvas-container/sidebar/channels/-page';
import {valueOfProperty} from 'emberclear/utils/dom/css';

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
  toggle: clickable('.top-nav a.navbar-burger'),
  isPresent: isPresent('aside'),

  isOpen: getter(function() {
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
