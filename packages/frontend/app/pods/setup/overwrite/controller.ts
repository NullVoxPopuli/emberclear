import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import CurrentUserService from 'emberclear/services/current-user';

export default class SetupOverwriteController extends Controller {
  @service currentUser!: CurrentUserService;

  @action
  didClickNo() {
    this.transitionToRoute('application');
  }

  @action
  didClickYes(this: SetupOverwriteController) {
    this.currentUser.set('allowOverride', true);
    this.transitionToRoute('setup');
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-overwrite-controller': SetupOverwriteController;
  }
}
