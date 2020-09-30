import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import SessionService from 'emberclear/services/session';

export default class LogoutController extends Controller {
  @service session!: SessionService;

  @action
  goBack() {
    history.back();
  }

  @action
  async logout() {
    await this.session.logout();

    this.transitionToRoute('application');
  }
}
