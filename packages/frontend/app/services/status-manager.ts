import Service from '@ember/service';
import { inject as service } from '@ember/service';

import StoreService from 'ember-data/store';
import ContactManager from 'emberclear/services/contact-manager';
import Contact, { Status } from 'emberclear/src/data/models/contact/model';

// TODO: does this need to be its own service?
//       should these functions move to the ContactManager?
export default class StatusManager extends Service {
  @service store!: StoreService;
  @service contactManager!: ContactManager;

  async markOffline(uid: string) {
    const contact = await this.contactManager.find(uid);

    contact.set('onlineStatus', Status.OFFLINE);

    contact.save();
  }

  async markOnline(uid: string | Contact) {
    let contact;

    if (typeof uid === 'string') {
      contact = await this.contactManager.find(uid);
    } else {
      contact = uid;
    }

    contact.set('onlineStatus', Status.ONLINE);
  }
}
