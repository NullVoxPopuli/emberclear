import Component from '@glimmer/component';
import StoreService from '@ember-data/store';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import Sidebar from 'emberclear/services/sidebar';
import { selectUnreadMessages } from 'emberclear/models/message/utils';
import RouterService from '@ember/routing/router-service';

export default class TopNav extends Component {
  @service declare currentUser: CurrentUserService;
  @service declare router: RouterService;
  @service declare sidebar: Sidebar;
  @service declare store: StoreService;

  get isInverted(): boolean {
    return this.router.currentRouteName !== 'index';
  }

  get allMessages() {
    return this.store.peekAll('message');
  }

  get hasUnread() {
    return this.unreadMessageCount > 0;
  }

  get unreadMessageCount() {
    if (!this.allMessages) return 0;

    const unread = selectUnreadMessages(this.allMessages.toArray());

    return unread.length;
  }

  get unreadMessageText() {
    return this.unreadMessageCount || '';
  }
}
