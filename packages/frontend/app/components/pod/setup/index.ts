import Component from '@glimmer/component';

import { inject as service } from '@ember/service';

import { useMachine } from 'ember-statecharts';
import { use } from 'ember-usable';

import { machineConfig } from './-machine';

import CurrentUserService from 'emberclear/services/current-user';
import RouterService from '@ember/routing/router-service';
import SessionService from 'emberclear/services/session';

type Args = {};

export default class SetupWizard extends Component<Args> {
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
