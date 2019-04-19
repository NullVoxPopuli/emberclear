import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupOverwriteController extends Controller {
  @service identity!: IdentityService;

  @action
  didClickNo() {
    this.transitionToRoute('application');
  }

  @action
  didClickYes(this: SetupOverwriteController) {
    this.identity.set('allowOverride', true);
    this.transitionToRoute('setup');
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-overwrite-controller': SetupOverwriteController;
  }
}
