import StoreService from 'ember-data/store';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';

import Message from 'emberclear/models/message';
import { selectUnreadDirectMessages } from 'emberclear/models/message/utils';
import SettingsService from 'emberclear/services/settings';
import SidebarService from 'emberclear/services/sidebar';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Contact, { STATUS } from 'emberclear/models/contact';
import Task from 'ember-concurrency/task';
import { currentUserId } from 'emberclear/services/current-user';

interface IArgs {
  contact: Contact;
  closeSidebar: () => void;
}

// TODO: need to write tests for the different states
//       of a contact list row.
export default class SidebarContact extends Component<IArgs> {
  @service router!: RouterService;
  @service store!: StoreService;
  @service settings!: SettingsService;
  @service sidebar!: SidebarService;

  @reads('settings.hideOfflineContacts') hideOfflineContacts!: boolean;

  get isActive() {
    const { contact } = this.args;

    return this.router.currentURL.includes(contact.id);
  }

  get shouldBeRendered() {
    const { contact } = this.args;

    if (contact.id === currentUserId) {
      return true;
    }

    // always show if online
    if (contact.onlineStatus !== STATUS.OFFLINE) {
      return true;
    }

    // always show if there are unread messages
    if (this.hasUnread) {
      return true;
    }

    // always show if currently viewing the chat
    if (this.isActive) {
      return true;
    }

    // do not show offline contacts if configured that way
    return !this.hideOfflineContacts;
  }

  get hasUnread() {
    return this.numberUnread > 0;
  }

  @tracked unreadMessages: Message[] = [];

  get numberUnread() {
    return this.unreadMessages.length;
  }

  @task(function*(this: SidebarContact) {
    let { contact } = this.args;
    let messages = yield this.store.findAll('message');
    let unread = selectUnreadDirectMessages(messages, contact.id);

    this.unreadMessages = unread;
  })
  findRelevantMessages!: Task;

  @action onClick() {
    if (window.innerWidth < TABLET_WIDTH) {
      this.args.closeSidebar();
    }

    this.router.transitionTo('chat.privately-with', this.args.contact.id);
  }
}
