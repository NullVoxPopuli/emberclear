import type StoreService from '@ember-data/store';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type Contact from 'emberclear/models/contact';

export default class ContactsTable extends Component {
  @service store!: StoreService;

  get contacts() {
    return this.store.peekAll('contact');
  }

  @action
  async remove(contact: Contact) {
    contact.deleteRecord();
    await contact.save();
    contact.unloadRecord();
  }
}
