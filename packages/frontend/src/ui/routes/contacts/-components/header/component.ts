import Component from 'sparkles-component';
import { inject as service } from '@ember/service';

import IdentityService from 'emberclear/services/identity/service';

export default class extends Component {
  @service identity!: IdentityService;
  @service store;

  get contacts() {
    let myId = this.identity.id;

    return this.store.peekAll('identity').filter(identity => {
      return identity.id !== myId;
    });
  }
}
