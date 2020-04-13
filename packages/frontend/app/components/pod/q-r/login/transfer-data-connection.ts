import RSVP from 'rsvp';
import { action } from '@ember/object';

import { EphemeralConnection } from 'emberclear/services/connection/ephemeral-connection';

export class TransferDataConnection extends EphemeralConnection {
  waitForACK = RSVP.defer<void>();
  waitForHash = RSVP.defer<string>();

  @action
  async transferToDevice() {
    this.waitForACK = RSVP.defer();
    this.waitForHash = RSVP.defer();

    await this.send({ type: 'SYN', data: this.hexId });
    await this.waitForACK.promise;

    let data = await this.settings.buildSettings();
    let hash = '111'; // TODO: implement this

    await this.send({
      type: 'DATA',
      hash,
      data,
    } as LoginData);

    let confirmedHash = await this.waitForHash.promise;

    if (hash !== confirmedHash) {
      throw new Error('Data transfer was not successful');
    }
  }

  @action
  async onData(data: RelayMessage) {
    let decrypted: LoginMessage = await this.crypto.decryptFromSocket(data);

    switch (decrypted.type) {
      case 'ACK':
        return this.waitForACK.resolve();
      case 'HASH':
        return this.waitForHash.resolve(decrypted.data);
      default:
        throw new Error('Unknown message received');
    }
  }
}
