import { DS } from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

import Identity, { Status } from 'emberclear/src/data/models/identity/model';

export default class StatusManager extends Service {
  @service store!: DS.Store;

  async markOffline(uid: string) {
    const contact = await this.store.findRecord('identity', uid);

    contact.set('onlineStatus', Status.OFFLINE);
  }

  async markOnline(uid: string | Identity) {
    let contact;

    if (typeof uid === 'string') {
      contact = await this.store.findRecord('identity', uid);
    } else {
      contact = uid;
    }

    contact.set('onlineStatus', Status.ONLINE);
  }
}
