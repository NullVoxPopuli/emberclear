
import { inject as service } from '@ember/service';
import { useMachine } from 'ember-statecharts';
import { use } from 'ember-usable';

import { ConnectionDoesNotExistError } from 'emberclear/utils/errors';
import CurrentUserService from 'emberclear/services/current-user';
import QRManager from 'emberclear/services/qr-manager';

import { SendDataConnection } from 'emberclear/services/connection/ephemeral/login/send-data';

import { machineConfig } from './-machine';
import { LoginQRData } from './-types';

export class StateMachine {
  @service currentUser!: CurrentUserService;
  @service qrManager!: QRManager;

  @use interpreter = useMachine(machineConfig).withConfig({
    services: {
      setupConnection: this.setupConnection.bind(this),
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


  get state() {
    return this.interpreter.state;
  }

  get context() {
    return this.interpreter.state.context;
  }

  send(...args) {
    return this.interpreter.send(...args);
  }

  /************************************************
   *
   * Private Methods to support the XState
   * State-Machine behavior.
   *
   */

  private connection?: SendDataConnection;

  private async setupConnection() {
    if (!this.interpreter.state) {
      throw new Error('No State' /* but what we make */);
    }

    // The State-Machine prevents this method from being called
    // without an existing `pub` (which is always present when)
    // the `intent` is "login"
    let { pub } = this.interpreter?.state?.context.data as LoginQRData[1];

    this.connection = await this.qrManager.login.setupConnection(this, pub);
  }

  private async transferData() {
    if (!this.connection) {
      throw new ConnectionDoesNotExistError();
    }

    await this.connection.transferToDevice();
  }

  private addContact() {
    // TODO
  }
}
