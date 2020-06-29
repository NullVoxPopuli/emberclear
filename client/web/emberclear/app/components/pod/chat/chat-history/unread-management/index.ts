import Component from '@glimmer/component';
import { action } from '@ember/object';

import Message from 'emberclear/models/message';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';

import { selectUnreadDirectMessages, markAsRead } from 'emberclear/models/message/utils';
import { scrollIntoViewOfParent, isInElementWithinViewport } from 'emberclear/utils/dom/utils';

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
    this.messagesElement = document.querySelector('[data-test-message-container]') as HTMLElement;
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
