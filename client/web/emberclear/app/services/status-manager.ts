import Service from '@ember/service';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import ContactManager from 'emberclear/services/contact-manager';
import Contact, { Status } from 'emberclear/models/contact';

// TODO: does this need to be its own service?
//       should these functions move to the ContactManager?
export default class StatusManager extends Service {
  @service declare store: StoreService;
  @service declare contactManager: ContactManager;

  async markOffline(uid: string) {
    const contact = await this.contactManager.find(uid);

    if (!contact) return;

    contact.onlineStatus = Status.OFFLINE;

    return contact.save();
  }

  async markOnline(uid: string | Contact) {
    let contact;

    if (typeof uid === 'string') {
      contact = await this.contactManager.find(uid);
    } else {
      contact = uid;
    }

    contact.onlineStatus = Status.ONLINE;
  }
}
