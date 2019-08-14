import Component from '@ember/component';
import StoreService from 'ember-data/store';
import { inject as service } from '@ember/service';

import { alias, equal } from '@ember/object/computed';

import CurrentUserService from 'emberclear/services/current-user';

import Sidebar from 'emberclear/services/sidebar';
import { selectUnreadMessages } from 'emberclear/models/message/utils';
import RouterService from '@ember/routing/router-service';

export default class TopNav extends Component {
  @service currentUser!: CurrentUserService;
  @service router!: RouterService;
  @service sidebar!: Sidebar;
  @service store!: StoreService;

  @alias('router.currentRouteName') routeName!: string;
  @alias('currentUser.isLoggedIn') isLoggedIn!: boolean;
  @equal('routeName', 'index') isApplication!: boolean;

  get isInverted(): boolean {
    return !this.isApplication;
  }

  get textColor() {
    if (this.isChat) return 'has-text-white';

    return '';
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
}
