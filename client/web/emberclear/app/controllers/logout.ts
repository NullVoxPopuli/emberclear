import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type SessionService from 'emberclear/services/session';
import type RouterService from '@ember/routing/router-service';

export default class LogoutController extends Controller {
  @service declare session: SessionService;
  @service declare router: RouterService;

  @action
  async logout() {
    await this.session.logout();
    await this.router.transitionTo('application');
  }
}
