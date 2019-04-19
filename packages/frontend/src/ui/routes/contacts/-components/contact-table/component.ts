import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Identity from 'emberclear/data/models/identity/model';
import IdentityService from 'emberclear/services/identity/service';

export default class ContactsTable extends Component {
  @service identity!: IdentityService;
  @service store;

  get contacts() {
    let myId = this.identity.id;

    return this.store.peekAll('identity').filter(identity => {
      return identity.id !== myId;
    });
  }

  @action remove(identity: Identity) {
    identity.deleteRecord();
    identity.save();
  }
}
