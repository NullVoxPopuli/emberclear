import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import { interpreterFor, useMachine } from 'ember-statecharts';
import { use } from 'ember-usable';

import { machineConfig } from './-machine';

import type RouterService from '@ember/routing/router-service';
import type CurrentUserService from 'emberclear/services/current-user';
import type SessionService from 'emberclear/services/session';

export default class SetupWizard extends Component {
  @service currentUser!: CurrentUserService;
  @service session!: SessionService;
  @service router!: RouterService;

  @use
  interpreter = interpreterFor(
    useMachine(machineConfig).withConfig({
      actions: {
        logout: () => this.session.logout(),
        redirectHome: () => this.router.transitionTo('application'),
      },
      guards: {
        isLoggedIn: () => this.currentUser.isLoggedIn,
      },
    })
  );
}
