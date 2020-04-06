import StoreService from '@ember-data/store';
import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { selectUnreadDirectMessages } from 'emberclear/models/message/utils';
import SettingsService from 'emberclear/services/settings';
import SidebarService from 'emberclear/services/sidebar';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Contact from 'emberclear/models/contact';
import { currentUserId } from 'emberclear/services/current-user';

interface IArgs {
  contact: Contact;
}

// TODO: need to write tests for the different states
//       of a contact list row.
export default class SidebarContact extends Component<IArgs> {
  @service router!: RouterService;
  @service store!: StoreService;
  @service settings!: SettingsService;
  @service sidebar!: SidebarService;

  get isActive() {
    const { contact } = this.args;

    return this.router.currentURL.includes(contact.id);
  }

  get hasUnread() {
    return this.numberUnread > 0;
  }

  get numberUnread() {
    return this.unreadMessages.length;
  }

  get unreadMessages() {
    let { contact } = this.args;
    let messages = this.store.peekAll('message');
    let unread = selectUnreadDirectMessages(messages, contact.id);

    return unread;
  }

  @action
  onClick() {
    if (window.innerWidth < TABLET_WIDTH) {
      this.sidebar.hide();
    }

    this.router.transitionTo('chat.privately-with', this.args.contact.id);
  }

  @action
  togglePin() {
    const { contact } = this.args;

    contact.isPinned = !contact.isPinned;

    return contact.save();
  }

  get canBePinned() {
    const { contact } = this.args;
    // can't pin your own chat
    return contact.id !== currentUserId;
  }
}
