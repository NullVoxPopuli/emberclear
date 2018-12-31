import Component, { tracked } from 'sparkles-component';
import { Registry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { reads, gt } from '@ember-decorators/object/computed';
import { task } from 'ember-concurrency-decorators';
import uuid from 'uuid';

import Identity, { STATUS } from 'emberclear/src/data/models/identity/model';
import Message from 'emberclear/src/data/models/message/model';
import { selectUnreadDirectMessages } from 'emberclear/src/data/models/message/utils';
import SettingsService from 'emberclear/src/services/settings';
import SidebarService from 'emberclear/src/services/sidebar/service';

interface IArgs {
  contact: Identity;
}

export default class SidebarContact extends Component<IArgs> {
  @service router!: Registry['router'];
  @service store;
  @service settings!: SettingsService;
  @service sidebar!: SidebarService;

  unreadElementId = uuid();

  @reads('settings.hideOfflineContacts') hideOfflineContacts!: boolean;

  @computed('router.currentURL')
  get isActive() {
    const { contact } = this.args;

    return this.router.currentURL.includes(contact.id);
  }

  @computed('args.contact.onlineStatus', 'hideOfflineContacts')
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

  @computed('messages.@each.unread')
  get numberUnread() {
    const { contact } = this.args;
    const messages = selectUnreadDirectMessages(this.messages, contact.id);

    return messages.length;
  }

  didInsertElement() {
    window.requestIdleCallback(() => this.findRelevantMessages.perform());
  }

  didRender() {
    window.requestIdleCallback(() => this.setupIntersectionObserver());
  }

  @task
  *findRelevantMessages() {
    const messages = yield this.store.findAll('message');

    this.messages = messages;
    window.requestIdleCallback(() => this.setupIntersectionObserver());
  }

  private setupIntersectionObserver() {
    if (!this.shouldBeRendered) return;
    if (!this.hasUnread) return;

    this.sidebar.observeIntersectionOf(this.unreadElementId);
  }
}
