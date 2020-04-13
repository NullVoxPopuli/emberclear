import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { interpret, createMachine, Interpreter, State } from 'xstate';
import { machineConfig, Context, Schema, Event } from './-machine';

import { getOwner } from '@ember/application';
import { TransferDataConnection } from './login/transfer-data-connection';

/*
TODO:
- State Machine
  - Logged in
    - scan add friend code
    - scan login to another device code
    - any other code is unrecognized
  - Not Logged in
    - scan add-friend code
      - will need to store code data while going through the setup process
    - any other code is unrecognized

*/
type Args = {};

export default class QRScan extends Component<Args> {
  @service intl!: Intl;

  @tracked current?: State<Context, Event, Schema>;

  interpreter: Interpreter<Context, Schema, Event>;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    let configuredMachine = createMachine<Context, Event>(machineConfig)
      .withContext({
        t: this.intl.t.bind(this.intl),
      })
      .withConfig({
        services: {
          transferData: this.transferData.bind(this),
        },
        actions: {
          // logout: () => this.session.logout(),
          // redirectHome: () => this.router.transitionTo('application'),
        },
        guards: {
          // isLoggedIn: () => this.currentUser.isLoggedIn,
        },
      });

    this.interpreter = interpret(configuredMachine);
    this.interpreter
      .onTransition((state) => (this.current = state))
      .onDone(() => console.info('QR Wizard Completed'))
      .start();
  }

  get state() {
    return this.current?.value;
  }

  get ctx() {
    return this.current?.context;
  }

  @action
  handleScan(data: string) {
    this.interpreter.send('SCAN', { data });
  }

  willDestroy() {
    super.willDestroy();

    this.interpreter.stop();
  }

  @action
  transition(transitionName: string) {
    this.interpreter.send(transitionName);
  }

  async transferData() {
    if (!this.current) {
      throw new Error('No State' /* but what we make */);
    }

    let { pub } = this.current.context.data;

    // Errors will be thrown if anything goes wrong...
    let connection = await TransferDataConnection.build(getOwner(this), pub);
    await connection.transferToDevice();
  }
}
