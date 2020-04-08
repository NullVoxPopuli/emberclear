import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { PRIVATE_CHAT_REGEX, idFrom } from 'emberclear/utils/route-matchers';

import StoreService from '@ember-data/store';
import SettingsService from 'emberclear/services/settings';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Contact, { Status } from 'emberclear/models/contact';
import CurrentUserService from 'emberclear/services/current-user';
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

  @tracked searchText = '';

  get allContacts() {
    return this.store.peekAll('contact').toArray();
  }

  get allChannels() {
    return this.store.peekAll('channel');
  }

  get contacts() {
    if (!this.hideOfflineContacts) {
      return this.allContacts
        .sort(sortByPinned)
        .filter(searchByName(this.searchText))
        .slice(0, 40);
    }

    let urlId = this.idFromURL;

    return this.allContacts
      .filter((contact) => {
        return (
          // online or other online~ish status
          contact.onlineStatus !== Status.OFFLINE ||
          // pinned contacts always show
          contact.isPinned ||
          // we are currently viewing the contact
          contact.uid === urlId ||
          // the contact has sent us messages that we haven't seen yet
          contact.numUnread > 0
        );
      })
      .sort(sortByPinned)
      .filter(searchByName(this.searchText))
      .slice(0, 40);
  }

  get chats() {
    return ['add-contact', this.currentUser.record, ...this.contacts, this.allChannels];
  }

  get idFromURL() {
    let url = this.router.currentURL;

    return idFrom(PRIVATE_CHAT_REGEX, url);
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

  @action
  handleSearch(e: Event) {
    this.searchText = (e.target as HTMLInputElement).value;
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

function searchByName(text: string) {
  if (!text) {
    return (contact: Contact) => contact;
  }

  let term = new RegExp(text, 'i');

  return (contact: Contact) => {
    return term.test(contact.name);
  }
}
