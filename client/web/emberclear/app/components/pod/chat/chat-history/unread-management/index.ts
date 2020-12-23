import Component from '@glimmer/component';
import { action } from '@ember/object';

import { markAsRead, selectUnreadDirectMessages } from 'emberclear/models/message/utils';
import { isInElementWithinViewport, scrollIntoViewOfParent } from 'emberclear/utils/dom/utils';

import type { Channel } from '@emberclear/local-account';
import type { Contact } from '@emberclear/local-account';
import type { Message } from '@emberclear/networking';

interface IArgs {
  to: Contact | Channel;
  messages: Message[];
}

export default class UnreadManagement extends Component<IArgs> {
  messagesElement!: HTMLElement;

  @action
  findMessagesContainer() {
    // TODO: remove this,
    //       scrolling should be handled by the chat-scroller service
    this.messagesElement = document.querySelector('.messages') as HTMLElement;
  }

  get unreadMessages() {
    const { to, messages } = this.args;
    const unread = selectUnreadDirectMessages(messages, to.id);

    return unread;
  }

  get numberOfUnread() {
    return this.unreadMessages.length;
  }

  get hasUnreadMessages() {
    return this.numberOfUnread > 0;
  }

  get shouldRender() {
    if (!this.hasUnreadMessages) return false;

    return this.hasUnreadOffScreen();
  }

  get firstUnreadMessage(): Message | undefined {
    return this.unreadMessages[0];
  }

  get dateOfFirstUnreadMessage(): Date | undefined {
    if (this.firstUnreadMessage) {
      return this.firstUnreadMessage.receivedAt;
    }

    return;
  }

  @action
  markAllAsRead() {
    return Promise.all(
      this.unreadMessages.map((message) => {
        return markAsRead(message);
      })
    );
  }

  @action
  scrollToFirstUnread() {
    if (this.firstUnreadMessage) {
      const firstUnread = document.getElementById(this.firstUnreadMessage.id)!;

      scrollIntoViewOfParent(this.messagesElement, firstUnread);
    }
  }

  private hasUnreadOffScreen() {
    if (this.firstUnreadMessage) {
      const firstUnread = document.getElementById(this.firstUnreadMessage.id);

      if (firstUnread) {
        const isOnScreen = isInElementWithinViewport(firstUnread, this.messagesElement);

        return !isOnScreen;
      }
    }

    return false;
  }
}
