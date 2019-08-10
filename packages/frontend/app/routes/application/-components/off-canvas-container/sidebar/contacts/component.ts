import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import StoreService from 'ember-data/store';
import SettingsService from 'emberclear/src/services/settings';
import { TABLET_WIDTH } from 'emberclear/src/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Contact, { STATUS } from 'emberclear/src/data/models/contact/model';
import CurrentUserService from 'emberclear/src/services/current-user/service';

interface IArgs {
  contacts: Contact[];
  closeSidebar: () => void;
}

export default class ContactsSidebar extends Component<IArgs> {
  @service currentUser!: CurrentUserService;
  @service settings!: SettingsService;
  @service router!: RouterService;
  @service store!: StoreService;

  get allContacts(): Contact[] {
    return this.store.peekAll('contact').toArray();
  }

  get contacts() {
    if (!this.hideOfflineContacts) {
      return this.allContacts;
    }

    return this.allContacts.filter(contact => {
      return contact.onlineStatus !== STATUS.OFFLINE;
    });
  }

  get hideOfflineContacts() {
    return this.settings.hideOfflineContacts;
  }

  get offlineContacts() {
    return this.allContacts.filter(contact => contact.onlineStatus === STATUS.OFFLINE);
  }

  get numberOffline() {
    return this.offlineContacts.length;
  }

  get showOfflineCounter() {
    return this.hideOfflineContacts && this.numberOffline > 0;
  }

  @action onClickAddFriend() {
    if (window.innerWidth < TABLET_WIDTH) {
      this.args.closeSidebar();
    }

    this.router.transitionTo('add-friend');
  }
}
