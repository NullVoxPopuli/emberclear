import StoreService from 'ember-data/store';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Contact from 'emberclear/src/data/models/contact/model';

export default class ContactsTable extends Component {
  @service store!: StoreService;

  get contacts() {
    return this.store.peekAll('contact');
  }

  @action remove(contact: Contact) {
    contact.deleteRecord();
    contact.save();
  }
}
