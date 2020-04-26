import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { DEBUG } from '@glimmer/env';

import { interpret, createMachine, Interpreter, State } from 'xstate';
import { machineConfig } from './-machine';
import { Context, Schema, Events, LoginQRData } from './-types';

import { SendDataConnection } from 'emberclear/services/connection/ephemeral/login/send-data';
import CurrentUserService from 'emberclear/services/current-user';

type Args = {};

export default class QRScan extends Component<Args> {
  @service intl!: Intl;
  @service currentUser!: CurrentUserService;

  @tracked current?: State<Context, Events, Schema>;

  interpreter: Interpreter<Context, Schema, Events>;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    let configuredMachine = createMachine<Context, Events>(machineConfig).withConfig({
      services: {
        transferData: this.transferData.bind(this),
        addContact: this.addContact.bind(this),
      },
      guards: {
        isQRLogin: ({ intent }) => intent === 'login',
        isQRAddFriend: ({ intent }) => intent === 'add-friend',
        hasError: ({ error }) => error === 'error',
        isContactKnown: () => false,
        isLoggedIn: () => this.currentUser.isLoggedIn,
      },
    });

    this.interpreter = interpret(configuredMachine, { devTools: DEBUG });
    this.interpreter
      .onTransition((state) => (this.current = state))
      .onDone(() => console.info('QR Wizard Completed'))
      .start();
  }

  get state() {
    return this.current?.toStrings();
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

    // The State-Machine prevents this method from being called
    // without an existing `pub` (which is always present when)
    // the `intent` is "login"
    let { pub } = this.current.context.data as LoginQRData[1];

    // Errors will be thrown if anything goes wrong...
    // TODO:
    // bubble events to the machine. https://bit.ly/3byNb9l
    let connection = await SendDataConnection.build(this, pub);
    await connection.transferToDevice();
  }

  addContact() {
    // TODO
  }
}
