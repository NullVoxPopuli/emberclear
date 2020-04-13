import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Toast from 'emberclear/services/toast';
import SettingsService from 'emberclear/services/settings';
import RouterService from '@ember/routing/router-service';

import { EphemeralConnection } from './ephemeral-connection';

export class ReceiveDataConnection extends EphemeralConnection {
  @service router!: RouterService;
  @service settings!: SettingsService;
  @service toast!: Toast;

  waitForSYN = RSVP.defer<string>();
  waitForData = RSVP.defer<LoginData>();

  @action
  async wait() {
    let senderPublicKey = await this.waitForSYN.promise;

    this.setTarget(senderPublicKey);

    await this.send({ type: 'ACK' });

    let { hash, data } = await this.waitForData.promise;

    let dataHash = '111';

    await this.send({ type: 'HASH', data: dataHash });

    if (hash === dataHash) {
      await this.settings.importData(data);

      this.toast.success('Logged in!');
      this.router.transitionTo('chat');
    }
  }

  @action
  async onData(data: RelayMessage) {
    let decrypted: LoginMessage = await this.crypto.decryptFromSocket(data);

    switch (decrypted.type) {
      case 'SYN':
        return this.waitForSYN.resolve(decrypted.data);
      case 'DATA':
        return this.waitForData.resolve(decrypted);
      default:
        throw new Error('Unknown message received');
    }
  }
}
