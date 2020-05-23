import Component from '@glimmer/component';

import { inject as service } from '@ember/service';

import { useMachine } from 'ember-statecharts';
import { use } from 'ember-usable';

import { machineConfig } from './-machine';

import CurrentUserService from 'emberclear/services/current-user';
import RouterService from '@ember/routing/router-service';
import SessionService from 'emberclear/services/session';

export default class SetupWizard extends Component {
  @service currentUser!: CurrentUserService;
  @service session!: SessionService;
  @service router!: RouterService;

  @use interpreter = useMachine(machineConfig).withConfig({
    actions: {
      logout: () => this.session.logout(),
      redirectHome: () => this.router.transitionTo('application'),
    },
    guards: {
      isLoggedIn: () => this.currentUser.isLoggedIn,
    },
  });
}
