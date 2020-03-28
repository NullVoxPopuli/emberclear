import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { interpret, createMachine, Interpreter, State, StateNode } from 'xstate';

import { machineConfig, Context, Schema, Event } from './-machine';

import CurrentUserService from 'emberclear/services/current-user';
import RouterService from '@ember/routing/router-service';
import SessionService from 'emberclear/services/session';

type Args = {};

export default class SetupWizard extends Component<Args> {
  @service currentUser!: CurrentUserService;
  @service session!: SessionService;
  @service router!: RouterService;

  @tracked current?: State<Context, Event, Schema>;

  interpreter: Interpreter<Context, Schema, Event>;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    let configuredMachine: StateNode<Context, Schema, Event> = createMachine<Context, Event>(
      machineConfig
    ).withConfig({
      actions: {
        logout: () => this.session.logout(),
        redirectHome: () => this.router.transitionTo('application'),
      },
      guards: {
        isLoggedIn: () => this.currentUser.isLoggedIn,
      },
    });

    this.interpreter = interpret(configuredMachine);
    this.interpreter.onTransition(state => (this.current = state)).start();
  }

  willDestroy() {
    super.willDestroy();

    this.interpreter.stop();
  }

  @action
  transition(transitionName: string) {
    this.interpreter.send(transitionName);
  }
}
