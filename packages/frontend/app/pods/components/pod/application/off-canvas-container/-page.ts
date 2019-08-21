import { find, triggerKeyEvent } from '@ember/test-helpers';
import { create, text, clickable, collection, fillable, isPresent } from 'ember-cli-page-object';
import { getter } from 'ember-cli-page-object/macros';



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

    let sidebarWidth = getComputedStyle(document.documentElement)
      .getPropertyValue('--sidenav-width')
      .split('px')[0]
      .trim();

    return style.includes(sidebarWidth);
  }),

  content: {
    scope: 'main',
  },

  sidebar: {
    scope: 'aside',

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

    footer: {
      scope: 'footer',
    },
  },
});
