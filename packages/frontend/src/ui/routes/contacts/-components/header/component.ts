import Component from 'sparkles-component';
import { filter } from '@ember-decorators/object/computed';
import { inject as service } from '@ember-decorators/service';

import Identity from 'emberclear/data/models/identity/model';
import IdentityService from 'emberclear/services/identity/service';

export default class extends Component {
  @service identity!: IdentityService;

  @filter('args.identities')
  contacts(identity: Identity) {
    return identity.id !== this.identity.id;
  }
}
