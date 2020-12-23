import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { Status } from '@emberclear/local-account/models/contact';

import type StoreService from '@ember-data/store';
import type { Contact } from '@emberclear/local-account';
import type ContactManager from '@emberclear/local-account/services/contact-manager';

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
