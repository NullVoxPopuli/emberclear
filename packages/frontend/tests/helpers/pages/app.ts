import { find, click, waitFor } from '@ember/test-helpers';
import { create, isVisible, text, clickable } from 'ember-cli-page-object';

const toast = '[data-test-notification-message]';

export const selectors = {
  headerUnread: '[data-test-unread-count]',
};

export const page = create({
  toast: {
    scope: '[data-test-notification-message]',
    isVisible: isVisible(),
    text: text(),
  },
  headerUnread: {
    scope: selectors.headerUnread,
  },
  notificationPrompt: {
    scope: '[data-test-notification-prompt]',
    isVisible: isVisible(),
    askLater: clickable('[data-test-ask-later]'),
    askNever: clickable('[data-test-ask-never]'),
    enable: clickable('[data-test-enable]'),
    dismiss: clickable('[data-test-dismiss]'),
  },
  modals: {},
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

  modals: {},

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
