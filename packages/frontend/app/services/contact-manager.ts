import StoreService from 'ember-data/store';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

import { fromHex } from 'emberclear/utils/string-encoding';
import Contact from 'emberclear/models/contact';
import ArrayProxy from '@ember/array/proxy';

export default class ContactManager extends Service {
  @service store!: StoreService;

  async findOrCreate(uid: string, name: string): Promise<Contact> {
    return await run(async () => {
      try {
        // an exception thrown here is never caught
        return await this.findAndSetName(uid, name);
      } catch (e) {
        return await this.create(uid, name);
      }
    });
  }

  async findAndSetName(uid: string, name: string): Promise<Contact> {
    let record = await this.find(uid);

    // always update the name
    record.set('name', name);

    await record.save();

    return record;
  }

  async create(uid: string, name: string): Promise<Contact> {
    const publicKey = fromHex(uid);

    let record = this.store.createRecord('contact', {
      id: uid,
      publicKey,
      name,
    });

    await record.save();

    return record;
  }

  async allContacts(): Promise<ArrayProxy<Contact>> {
    const contacts = await this.store.findAll('contact');

    return contacts;
  }

  async addContact(/* _info: any */) {
    try {
      // const existing = this.find(info.id);
      // return? error?
    } catch (e) {
      // maybe find should do the try/catching...
      // seems weird to try/catch every time we want to use find
    }
  }

  find(uid: string) {
    return this.store.findRecord('contact', uid);
  }
}

declare module '@ember/service' {
  interface Registry {
    'contact-manager': ContactManager;
  }
}
