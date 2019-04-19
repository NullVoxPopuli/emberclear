import Service from '@ember/service';
import { inject as service } from '@ember/service';

import Identity, { Status } from 'emberclear/src/data/models/identity/model';
import ContactManager from 'emberclear/services/contact-manager';

// TODO: does this need to be its own service?
//       should these functions move to the ContactManager?
export default class StatusManager extends Service {
  @service store;
  @service contactManager!: ContactManager;

  async markOffline(uid: string) {
    const contact = await this.contactManager.find(uid);

    contact.set('onlineStatus', Status.OFFLINE);

    contact.save();
  }

  async markOnline(uid: string | Identity) {
    let contact;

    if (typeof uid === 'string') {
      contact = await this.contactManager.find(uid);
    } else {
      contact = uid;
    }

    contact.set('onlineStatus', Status.ONLINE);
  }
}
