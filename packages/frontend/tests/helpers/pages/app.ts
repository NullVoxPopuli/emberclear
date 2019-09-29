import { find, click, waitFor, waitUntil } from '@ember/test-helpers';
import { create, isVisible, text, clickable } from 'ember-cli-page-object';

const toast = '.toastify';

export const selectors = {
  headerUnread: '[data-test-unread-count]',
};

export const page = create({
  toast: {
    scope: '.toastify',
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
    toast: '.toastify',
  },
  toast: () => find(toast),
  toastText: () => find(toast)!.textContent,
  dismissToast: () => click(toast),
  waitForToast: () => waitUntil(() => document.querySelector(toast), { timeout: 300 }),

  scrollContainer: () => find('#scrollContainer') as HTMLElement,

  modals: {},

  footer: {
    faq: () => find('[data-test-footer-faq]') as HTMLElement,
    clickFaq: () => click('[data-test-footer-faq]'),
  },
};

export default {
  app,
};
