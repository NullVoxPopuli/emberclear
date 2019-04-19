import Component from '@ember/component';
import StoreService from 'ember-data/store';
import { Registry } from '@ember/service';
import { inject as service } from '@ember/service';

import { alias, equal } from '@ember/object/computed';

import IdentityService from 'emberclear/services/identity/service';
import Sidebar from 'emberclear/services/sidebar/service';
import { selectUnreadMessages } from 'emberclear/src/data/models/message/utils';

export default class TopNav extends Component {
  @service identity!: IdentityService;
  @service router!: Registry['router'];
  @service sidebar!: Sidebar;
  @service store!: StoreService;

  @alias('router.currentRouteName') routeName!: string;
  @alias('identity.isLoggedIn') isLoggedIn!: boolean;
  @equal('routeName', 'index') isApplication!: boolean;

  get isChat(): boolean {
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

    const unread = selectUnreadMessages(this.allMessages);

    return unread.length;
  }
}
