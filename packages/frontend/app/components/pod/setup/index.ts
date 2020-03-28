import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { interpret, Interpreter, EventObject, State } from 'xstate';

import { setupMachine, Context, Schema } from './-machine';

import CurrentUserService from 'emberclear/services/current-user';
import RouterService from '@ember/routing/router-service';
import SessionService from 'emberclear/services/session';

type Args = {};

export default class SetupWizard extends Component<Args> {
  @service currentUser!: CurrentUserService;
  @service session!: SessionService;
  @service router!: RouterService;

  @tracked state?: State<Context, EventObject, any, any>;

  machine: Interpreter<Context, Schema, EventObject, any>;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    this.machine = interpret(
      setupMachine().withConfig({
        actions: {
          logout: () => this.session.logout(),
          redirectHome: () => this.router.transitionTo('application'),
        },
        guards: {
          isLoggedIn: () => this.currentUser.isLoggedIn,
        },
      })
    );

    this.machine.onTransition(state => (this.state = state)).start();
  }

  willDestroy() {
    this.machine.stop();

    super.willDestroy();
  }

  // get showWarning() {
  //   let identityAlreadyExists = this.currentUser.record?.privateKey;
  //   let intendingToReCreate = !this.currentUser.allowOverride;
  //   let onCompletedRoute = router.currentRouteName.match(/completed/);
  //   let onARouteThatWarnsOfDanger = !onCompletedRoute;

  //   return (intendingToReCreate && identityAlreadyExists && onARouteThatWarnsOfDanger);
  // }

  @action
  transition(transitionName: string) {
    this.machine.send(transitionName);
  }
}
