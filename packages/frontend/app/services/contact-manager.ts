import StoreService from '@ember-data/store';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import { fromHex } from 'emberclear/utils/string-encoding';
import Contact from 'emberclear/models/contact';
import ArrayProxy from '@ember/array/proxy';

export default class ContactManager extends Service {
  @service store!: StoreService;

  @tracked isImporting = false;

  find(uid: string) {
    return this.store.findRecord('contact', uid);
  }

  async import(contacts: IdentityJson[]) {
    this.isImporting = true;

    try {
      for await (let contact of contacts) {
        if (!contact.publicKey || !contact.name) return Promise.resolve();

        await this.findOrCreate(contact.publicKey, contact.name);
      }
    } finally {
      this.isImporting = false;
    }
  }



  async findOrCreate(uid: string, name: string): Promise<Contact> {
    try {
      // an exception thrown here is never caught
      return await this.findAndSetName(uid, name);
    } catch (e) {
      return await this.create(uid, name);
    }
  }

  async allContacts(): Promise<ArrayProxy<Contact>> {
    const contacts = await this.store.findAll('contact');

    return contacts;
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

  async addContact(/* _info: any */) {
    try {
      // const existing = this.find(info.id);
      // return? error?
    } catch (e) {
      // maybe find should do the try/catching...
      // seems weird to try/catch every time we want to use find
    }
  }

  private async findAndSetName(uid: string, name: string): Promise<Contact> {
    let record = await this.find(uid);

    // always update the name
    record.name = name;

    await record.save();

    return record;
  }
}

declare module '@ember/service' {
  interface Registry {
    'contact-manager': ContactManager;
  }
}
