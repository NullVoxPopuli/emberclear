import Component from '@glimmer/component';
import { action } from '@ember/object';

import Message from 'emberclear/src/data/models/message/model';
import Channel from 'emberclear/src/data/models/channel';
import Contact from 'emberclear/src/data/models/contact/model';

import { selectUnreadDirectMessages, markAsRead } from 'emberclear/src/data/models/message/utils';
import { scrollIntoViewOfParent, isInElementWithinViewport } from 'emberclear/src/utils/dom/utils';
import { assert } from '@ember/debug';

interface IArgs {
  to: Contact | Channel;
  messages: Message[];
}

export default class UnreadManagement extends Component<IArgs> {
  messagesElement!: HTMLElement;

  @action findMessagesContainer() {
    this.messagesElement = document.querySelector('.messages') as HTMLElement;

    assert(`Messages element not found! Did another error occur?`, !!this.messagesElement);
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
  }

  @action markAllAsRead() {
    this.unreadMessages.forEach(message => {
      markAsRead(message);
    });
  }

  @action scrollToFirstUnread() {
    if (this.firstUnreadMessage) {
      const firstUnread = document.getElementById(this.firstUnreadMessage.id)!;

      assert(
        `[scrollToFirstUnread] Attempted to scroll to message that does not exist: ${
          this.firstUnreadMessage.id
        }. It may not actually be rendered in the dom.`,
        !!firstUnread
      );

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
