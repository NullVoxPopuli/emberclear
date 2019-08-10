import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { notEmpty, and, alias, not, match } from '@ember/object/computed';

import CurrentUserService from 'emberclear/services/current-user/service';

import RouterService from '@ember/routing/router-service';

export default class SetupController extends Controller {
  @service currentUser!: CurrentUserService;
  @service router!: RouterService;

  @notEmpty('currentUser.record.privateKey') identityAlreadyExists!: boolean;
  @alias('currentUser.allowOverride') allowOverride!: boolean;
  @not('allowOverride') intendingToReCreate!: boolean;

  @alias('router.currentRouteName') routeName!: string;
  @match('routeName', /completed/) onCompletedRoute!: boolean;
  @not('onCompletedRoute') onARouteThatWarnsOfDanger!: boolean;

  @and('intendingToReCreate', 'identityAlreadyExists', 'onARouteThatWarnsOfDanger')
  showWarning!: boolean;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-controller': SetupController;
  }
}
