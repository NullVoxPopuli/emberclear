import { find, click } from '@ember/test-helpers';
import { create, isVisible, clickable } from 'ember-cli-page-object';

import { keyPressFor } from '@emberclear/ui/test-support/key-events';

export const selectors = {
  headerUnread: '[data-test-unread-count]',
};

export const page = create({
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
  modals: {
    search: {
      async open() {
        await keyPressFor(document.body, 75, { ctrlKey: true });
      },
    },
  },
});

export const app = {
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
