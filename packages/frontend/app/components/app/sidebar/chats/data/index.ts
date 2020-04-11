import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { PRIVATE_CHAT_REGEX, idFrom } from 'emberclear/utils/route-matchers';

import StoreService from '@ember-data/store';
import SettingsService from 'emberclear/services/settings';
import RouterService from '@ember/routing/router-service';
import Contact, { Status } from 'emberclear/models/contact';
import CurrentUserService from 'emberclear/services/current-user';
import ContactManager from 'emberclear/services/contact-manager';
import SidebarService from 'emberclear/services/sidebar';

type Args = {
  searchText?: string;
}

export default class SidebarChatData extends Component<Args> {
  @service currentUser!: CurrentUserService;
  @service settings!: SettingsService;
  @service router!: RouterService;
  @service store!: StoreService;
  @service contactManager!: ContactManager;
  @service sidebar!: SidebarService;

  get allContacts() {
    return this.store.peekAll('contact').toArray();
  }

  get allChannels() {
    return this.store.peekAll('channel').toArray();
  }

  get channels() {
    let { searchText } = this.args;
    let channels = this.allChannels;

    if (!searchText) {
      return channels;
    }

    return channels.filter(searchByName(searchText));
  }

  get contacts() {
    let { searchText } = this.args;
    let contacts = this.allContacts;
    let urlId = this.idFromURL;

    if (this.hideOfflineContacts && !searchText) {
      contacts = contacts.filter((contact) => {
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
    }

    if (searchText) {
      contacts = contacts.filter(searchByName(searchText));
    }

    return contacts
      .sort(sortByPinned)
      .slice(0, 40);
  }

  get chats() {
    return ['add-contact', this.currentUser.record, ...this.contacts, ...this.channels];
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
  let term = new RegExp(text, 'i');

  return (contact: Contact) => {
    return term.test(contact.name);
  };
}
