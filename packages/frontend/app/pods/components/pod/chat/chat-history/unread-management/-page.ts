import { clickable } from 'ember-cli-page-object';

export const definition = {
  scope: '[data-test-unread-floater]',

  scrollToFirstUnread: clickable('[data-test-scroll-to-unread]'),
  markAllRead: clickable('[data-test-mark-all-read]'),
};
