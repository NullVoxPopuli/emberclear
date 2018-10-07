import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { filter } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import Identity from 'emberclear/data/models/identity/model';
import IdentityService from 'emberclear/services/identity/service';

export default class extends Component {
  @service identity!: IdentityService;

  @filter('identities')
  contacts(identity: Identity) {
    return identity.id !== this.identity.id;
  }

  @action
  remove(identity: Identity) {
    identity.deleteRecord();
    identity.save();
  }
}
