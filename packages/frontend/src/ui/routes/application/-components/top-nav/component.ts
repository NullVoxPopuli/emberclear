import Component from '@ember/component';
import StoreService from 'ember-data/store';
import { Registry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { alias, equal, gt } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';
import Sidebar from 'emberclear/services/sidebar/service';
import { monitor } from 'emberclear/src/utils/decorators';
import { selectUnreadMessages } from 'emberclear/src/data/models/message/utils';

export default class TopNav extends Component {
  @service identity!: IdentityService;
  @service router!: Registry['router'];
  @service sidebar!: Sidebar;
  @service store!: StoreService;

  @alias('router.currentRouteName') routeName!: string;
  @alias('identity.isLoggedIn') isLoggedIn!: boolean;
  @equal('routeName', 'index') isApplication!: boolean;

  @computed('isApplication')
  get isChat(): boolean {
    return !this.isApplication;
  }

  @computed('isChat')
  get textColor() {
    if (this.isChat) return 'has-text-white';

    return '';
  }

  @computed()
  @monitor
  get allMessages() {
    return this.store.findAll('message');
  }

  @gt('unreadMessageCount', 0) hasUnread!: boolean;

  @computed('allMessages.result.@each.readAt')
  get unreadMessageCount() {
    if (!this.allMessages.result) return 0;

    const unread = selectUnreadMessages(this.allMessages.result);

    return unread.length;
  }

  @action
  toggleSidebar(this: TopNav) {
    this.sidebar.toggle();
  }
}
