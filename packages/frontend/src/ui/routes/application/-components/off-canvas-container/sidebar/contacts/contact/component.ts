import StoreService from 'ember-data/store';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { Registry } from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads, gt } from '@ember/object/computed';
import { task } from 'ember-concurrency';

import Identity, { STATUS } from 'emberclear/src/data/models/identity/model';
import Message from 'emberclear/src/data/models/message/model';
import { selectUnreadDirectMessages } from 'emberclear/src/data/models/message/utils';
import SettingsService from 'emberclear/src/services/settings';
import SidebarService from 'emberclear/src/services/sidebar/service';
import { TABLET_WIDTH } from 'emberclear/src/utils/breakpoints';

interface IArgs {
  contact: Identity;
}

export default class SidebarContact extends Component<IArgs> {
  @service router!: Registry['router'];
  @service store!: StoreService;
  @service settings!: SettingsService;
  @service sidebar!: SidebarService;

  @reads('settings.hideOfflineContacts') hideOfflineContacts!: boolean;

  // @computed('router.currentURL')
  get isActive() {
    const { contact } = this.args;

    return this.router.currentURL.includes(contact.id);
  }

  // @computed('args.contact.onlineStatus', 'hideOfflineContacts')
  get shouldBeRendered() {
    const { contact } = this.args;

    // always show if online
    if (contact.onlineStatus !== STATUS.OFFLINE) {
      return true;
    }

    // always show if there are unread messages
    if (this.hasUnread) {
      return true;
    }

    // do not show offline contacts if configured that way
    return !this.hideOfflineContacts;
  }

  @gt('numberUnread', 0) hasUnread!: boolean;

  @tracked messages: Message[] = [];

  // @computed('messages.@each.unread')
  get numberUnread() {
    const { contact } = this.args;
    const messages = selectUnreadDirectMessages(this.messages, contact.id);

    return messages.length;
  }

  @task(function*(this: SidebarContact) {
    const messages = yield this.store.findAll('message');

    this.messages = messages;
  })
  findRelevantMessages;

  @action onClick() {
    if (window.innerWidth < TABLET_WIDTH) {
      this.args.closeSidebar();
    }

    this.router.transitionTo('chat.privately-with', this.args.contact.id);
  }
}
