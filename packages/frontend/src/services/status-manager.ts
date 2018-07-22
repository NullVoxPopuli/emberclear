import { DS } from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import Identity, { Status } from 'emberclear/src/data/models/identity/model';
import ContactManager from 'emberclear/services/contact-manager';

// TODO: does this need to be its own service?
//       should these functions move to the ContactManager?
export default class StatusManager extends Service {
  @service store!: DS.Store;
  @service contactManager!: ContactManager;

  async markOffline(uid: string) {
    const contact = await this.contactManager.find(uid);

    contact.set('onlineStatus', Status.OFFLINE);
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
