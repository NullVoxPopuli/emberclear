import { find, click, waitFor, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import {
  create,
  collection,
  is,
  count,
  attribute,
  isVisible,
  text,
  isPresent,
  notHasClass,
  fillable,
  property,
  clickable,
} from 'ember-cli-page-object';

const toast = '[data-test-notification-message]';

export const page = create({
  toast: {
    scope: '[data-test-notification-message]',
    isVisible: isVisible(),
    text: text(),
  },
  headerUnread: {
    scope: '[data-test-unread-count]',
    isVisible: isVisible,
    isPresent: isPresent(),
    text: text(),
  },
  notificationPrompt: {
    scope: '[data-test-notification-prompt]',
    isVisible: isVisible(),
    askLater: clickable('[data-test-ask-later]'),
    askNever: clickable('[data-test-ask-never]'),
    enable: clickable('[data-test-enable]'),
    dismiss: clickable('[data-test-dismiss]'),
  },
  modals: {
    addContact: {
      scope: '[data-test-add-contact]',
      isHidden: notHasClass('is-active'),
      hide: clickable('[aria-label="Close Modal"]'),
    },
  },
});

export const app = {
  selectors: {
    toast: '[data-test-notification-message]',
  },
  toast: () => find(toast),
  toastText: () => find(toast)!.textContent,
  dismissToast: () => click(toast),
  waitForToast: () => waitFor(toast, { timeout: 100 }),

  scrollContainer: () => find('#scrollContainer') as HTMLElement,

  modals: {
    addContact: {
      isHidden: () => find('[data-test-add-contact][aria-modal][aria-hidden]'),
      hide: () => click('[data-test-add-contact] [aria-label="Close Modal"]'),
    },

    shareInfo: {
      isHidden: () => find('[data-test-share-info][aria-modal][aria-hidden]'),
      hide: () => click('[data-test-share-info] [aria-label="Close Modal"]'),
    },
  },

  userDropdown: {
    open: () => click('[data-test-user-dropdown-toggle]'),
    clickLogout: () => click('[data-test-user-dropdown] [data-test-logout]'),
    logoutButton: () => find('[data-test-user-dropdown] [data-test-logout]'),
  },

  footer: {
    faq: () => find('[data-test-footer-faq]') as HTMLElement,
    clickFaq: () => click('[data-test-footer-faq]'),
  },
};

export default {
  app,
};
