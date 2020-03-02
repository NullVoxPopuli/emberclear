import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { PRIVATE_CHAT_REGEX, idFrom } from 'emberclear/utils/route-matchers';

import StoreService from '@ember-data/store';
import SettingsService from 'emberclear/services/settings';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Contact, { Status } from 'emberclear/models/contact';
import CurrentUserService from 'emberclear/services/current-user';
import { selectUnreadDirectMessages } from 'emberclear/models/message/utils';
import ContactManager from 'emberclear/services/contact-manager';

interface IArgs {
  contacts: Contact[];
  closeSidebar: () => void;
}

export default class ContactsSidebar extends Component<IArgs> {
  @service currentUser!: CurrentUserService;
  @service settings!: SettingsService;
  @service router!: RouterService;
  @service store!: StoreService;
  @service contactManager!: ContactManager;

  get allContacts(): Contact[] {
    return this.store
      .peekAll('contact')
      .toArray()
      .filter(contact => contact.publicKey);
  }

  get contacts() {
    let sortedContacts = this.allContacts.sort(sortByPinned);

    if (!this.hideOfflineContacts) {
      return sortedContacts;
    }

    let url = this.router.currentURL;

    let allMessages = this.store.peekAll('message').toArray();

    console.log(sortedContacts.length);
    return sortedContacts.filter(contact => {
      return (
        // online or other online~ish status
        contact.onlineStatus !== Status.OFFLINE ||
        // pinned contacts always show
        contact.isPinned ||
        // we are currently viewing the contact
        idFrom(PRIVATE_CHAT_REGEX, url) === contact.uid ||
        // the contact has sent us messages that we haven't seen yet
        selectUnreadDirectMessages(allMessages, contact.id).length > 0
      );
    });
  }

  get hideOfflineContacts() {
    return this.settings.hideOfflineContacts;
  }

  get offlineContacts() {
    let contacts = this.contacts;

    return this.allContacts.filter(contact => {
      return !contacts.includes(contact);
    });
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

function sortByPinned(contact1: Contact, contact2: Contact) {
  if (contact1.isPinned === contact2.isPinned) {
    return 0;
  } else if (contact1.isPinned) {
    return -1;
  }
  return 1;
}
