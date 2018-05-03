import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';

import IdentityService from 'emberclear/services/identity';

export default class SetupController extends Controller {
  @service('identity') identity!: IdentityService;

  name!: string;

  @action
  createIdentity(this: SetupController) {
    this.identity.create(this.name);

    this.transitionToRoute('setup.completed');
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup': SetupController;
  }
}
