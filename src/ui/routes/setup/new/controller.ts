import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { notEmpty } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupNewController extends Controller {
  @service identity!: IdentityService;

  @notEmpty('identity.record.privateKey') identityAlreadyExists!: boolean;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-new-controller': SetupNewController;
  }
}
