import { find, click, waitFor, fillIn, triggerKeyEvent } from '@ember/test-helpers';
import {
  create,
  collection,
  is,
  count,
  isVisible,
  text,
  fillable,
  clickable,
} from 'ember-cli-page-object';

const toast = '[data-test-notification-message]';

export const page = create({
  hasNotificationPrompt: isVisible('[data-test-notification-prompt]'),
  notificationPrompt: {
    scope: '[data-test-notification-prompt]',
    isVisible: isVisible(),
    askLater: clickable('[data-test-ask-later]'),
    askNever: clickable('[data-test-ask-never]'),
    enable: clickable('[data-test-enable]'),
    dismiss: clickable('[data-test-dismiss]'),
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
