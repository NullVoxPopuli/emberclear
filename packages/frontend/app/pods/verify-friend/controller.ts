import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import CurrentUserService from 'emberclear/services/current-user';

export default class extends Controller {
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;

  get uid() {
    return this.model.targetIdentity.uid;
  }

}
