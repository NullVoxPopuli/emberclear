import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { interpreterFor, useMachine } from 'ember-statecharts';
import { use } from 'ember-usable';

import { ConnectionDoesNotExistError } from 'emberclear/utils/errors';

import { machineConfig } from './-machine';

import type { LoginQRData } from './-types';
import type { CurrentUserService } from '@emberclear/local-account';
import type { SendDataConnection } from 'emberclear/services/connection/ephemeral/login/send-data';
import type QRManager from 'emberclear/services/qr-manager';

export default class QRScan extends Component {
  @service intl!: Intl;
  @service currentUser!: CurrentUserService;
  @service qrManager!: QRManager;

  @use
  interpreter = interpreterFor(
    useMachine(machineConfig).withConfig({
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
    })
  );

  connection?: SendDataConnection;

  get state() {
    return this.interpreter?.state?.toStrings();
  }

  get ctx() {
    return this.interpreter?.state?.context;
  }

  @action
  handleScan(data: string) {
    this.interpreter.send('SCAN', { data });
  }

  @action
  transition(transitionName: string) {
    this.interpreter.send(transitionName);
  }

  async setupConnection() {
    if (!this.interpreter?.state) {
      throw new Error('No State' /* but what we make */);
    }

    // The State-Machine prevents this method from being called
    // without an existing `pub` (which is always present when)
    // the `intent` is "login"
    let { pub } = this.interpreter?.state?.context.data as LoginQRData[1];

    this.connection = await this.qrManager.login.setupConnection(this, pub);
  }

  async transferData() {
    if (!this.connection) {
      throw new ConnectionDoesNotExistError();
    }

    await this.connection.transferToDevice();
  }

  addContact() {
    // TODO
  }
}
