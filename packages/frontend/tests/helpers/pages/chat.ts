import {
  create,
  attribute,
  collection,
  count,
  isVisible,
  text,
  fillable,
  clickable,
} from 'ember-cli-page-object';

import { typeIn } from '@ember/test-helpers';

import { definition as unreadMessagesFloater } from 'emberclear/components/pod/chat/chat-history/unread-management/-page';
import { definition as dropdownPage } from 'emberclear/components/dropdown/-page';
import { definition as embedModal } from 'emberclear/components/pod/chat/chat-entry/embeds-menu/snippet/-page';
import { definition as newMessagesFloater } from 'emberclear/components/chat/chat-history/new-messages/-page';

export const selectors = {
  form: '[data-test-chat-entry-form]',
  textarea: '[data-test-chat-entry]',
  message: '[data-test-chat-message]',
  submitButton: '[data-test-chat-submit]',
  confirmations: '[data-test-confirmations]',
};

export const page = create({
  isScrollable() {
    let messagesElement = document.querySelector('.messages')!;

    return isScrollable(messagesElement);
  },

  scroll(amountInPx: number) {
    let messagesElement = document.querySelector('.messages')!;

    let current = messagesElement.scrollTop;
    let next = current + amountInPx;

    messagesElement.scrollTo({ left: 0, top: next });
  },

  // actual page object things
  textarea: {
    scope: '[data-test-chat-entry]',
    isDisabled: attribute('disabled'),
    fillIn: fillable(),
    typeIn(substring: string) {
      return typeIn('[data-test-chat-entry]', substring);
    },
  },

  chatOptions: {
    ...dropdownPage,

    scope: '[data-test-chat-options-dropdown]',

    toggleEmbedModal: clickable('[data-test-embeds-toggle]'),
  },

  embedModal,
  unreadMessagesFloater,

  submitButton: {
    scope: '[data-test-chat-submit]',
    isDisabled: attribute('disabled'),
  },
  newMessagesFloater,
  numberOfMessages: count('[data-test-chat-message]'),
  messages: collection('[data-test-chat-message]', {
    hasLoader: isVisible('.ellipsis-loader'),
    hasCode: isVisible('.token', { multiple: true }),
    confirmations: {
      scope: '[data-test-confirmations]',
      text: text(),
      hoverTip: text('.hover-tip'),
      delete: clickable('[data-test-delete]'),
      resend: clickable('[data-test-resend]'),
      autosend: clickable('[data-test-autosend]'),
      isLoading: isVisible('.ellipsis-loader'),
    },
  }),
});

export function isScrollable(element: Element) {
  return element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;
}
