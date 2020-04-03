import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { dependentKeyCompat } from '@ember/object/compat';

import { PRIVATE_CHAT_REGEX, idFrom } from 'emberclear/utils/route-matchers';

import StoreService from '@ember-data/store';
import SettingsService from 'emberclear/services/settings';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Contact, { Status } from 'emberclear/models/contact';
import CurrentUserService from 'emberclear/services/current-user';
// import { selectUnreadDirectMessages } from 'emberclear/models/message/utils';
import ContactManager from 'emberclear/services/contact-manager';
import SidebarService from 'emberclear/services/sidebar';

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
  @service sidebar!: SidebarService;

  @dependentKeyCompat
  get allContacts(): Contact[] {
    return this.store
      .peekAll('contact')
      .toArray()
      .filter((contact) => contact.publicKey);
  }

  @dependentKeyCompat
  get allChannels() {
    return this.store.peekAll('channel');
  }

  // TODO: This is too expensive. Push into adapter
  // Need a live array -- refiltering everytime something changes is far too constly
  @computed('hideOfflineContacts', 'router.currentURL', 'allContacts.@each.onlineStatus', 'allContacts.@each.isPinned')
  get contacts() {
    if (!this.hideOfflineContacts) {
      return this.allContacts.sort(sortByPinned);
    }

    let url = this.router.currentURL;
    let urlId = idFrom(PRIVATE_CHAT_REGEX, url);

    // TODO: looking at all messages here is too expensive.
    //       maybe make showing contacts based on unread messages
    //       a background job or something.
    // let allMessages = this.store.peekAll('message');

    return this.allContacts
      .filter((contact) => {
        return (
          // online or other online~ish status
          contact.onlineStatus !== Status.OFFLINE ||
          // pinned contacts always show
          contact.isPinned ||
          // we are currently viewing the contact
          urlId === contact.uid ||
          // the contact has sent us messages that we haven't seen yet
          // selectUnreadDirectMessages(allMessages, contact.id).length > 0
          false
        );
      })
      .sort(sortByPinned);
  }

  get chats() {
    return ['add-contact', this.currentUser.record, ...this.contacts, this.allChannels];
  }

  get hideOfflineContacts() {
    return this.settings.hideOfflineContacts;
  }

  get offlineContacts() {
    let contacts = this.contacts;

    return this.allContacts.filter((contact) => {
      return !contacts.includes(contact);
    });
  }

  get numberOffline() {
    return this.offlineContacts.length;
  }

  get showOfflineCounter() {
    return this.hideOfflineContacts && this.numberOffline > 0;
  }

  @action
  onClickAddFriend() {
    if (window.innerWidth < TABLET_WIDTH) {
      this.sidebar.hide();
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
