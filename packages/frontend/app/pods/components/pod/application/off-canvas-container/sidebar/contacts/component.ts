import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import StoreService from 'ember-data/store';
import SettingsService from 'emberclear/services/settings';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Contact, { STATUS } from 'emberclear/models/contact';
import CurrentUserService from 'emberclear/services/current-user';

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
    const sortedContacts = this.allContacts.sort(compareFunction);
    if (!this.hideOfflineContacts) {
      return sortedContacts;
    }
    return sortedContacts.filter(shouldBeInSidebar);
  }

  get hideOfflineContacts() {
    return this.settings.hideOfflineContacts;
  }

  get offlineContacts() {
    return this.allContacts.filter(contact => !shouldBeInSidebar(contact));
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

const compareFunction = function(contact1: Contact, contact2: Contact) {
  if (contact1.isPinned === contact2.isPinned) {
    return 0;
  } else if (contact1.isPinned) {
    return -1;
  }
  return 1;
};

const shouldBeInSidebar = function(contact: Contact) {
  return contact.onlineStatus !== STATUS.OFFLINE || contact.isPinned;
};
