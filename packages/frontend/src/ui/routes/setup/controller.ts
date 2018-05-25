import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { notEmpty, and, alias, not } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class SetupController extends Controller {
  @service identity!: IdentityService;

  @notEmpty('identity.record.privateKey') identityAlreadyExists!: boolean;
  @alias('identity.allowOverride') allowOverride!: boolean;
  @not('allowOverride') intendingToReCreate!: boolean;
  @and('intendingToReCreate', 'identityAlreadyExists') showWarning!: boolean;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-controller': SetupController;
  }
}
