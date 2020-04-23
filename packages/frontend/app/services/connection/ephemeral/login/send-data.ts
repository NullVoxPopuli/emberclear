import RSVP from 'rsvp';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';

import { taskFor } from 'emberclear/utils/ember-concurrency';

import { EphemeralConnection } from '../ephemeral-connection';
import { UnknownMessageError, DataTransferFailed } from '../../errors';

export class SendDataConnection extends EphemeralConnection {
  waitForACK = RSVP.defer<void>();
  waitForHash = RSVP.defer<string>();

  @action
  transferToDevice() {
    this.waitForACK = RSVP.defer();
    this.waitForHash = RSVP.defer();

    return taskFor(this._transferToDevice).perform();
  }

  @dropTask
  *_transferToDevice() {
    yield this.send({ type: 'SYN', data: this.hexId });
    yield this.waitForACK.promise;

    let data = yield this.settings.buildSettings();
    let hash = '111'; // TODO: implement this

    yield this.send({ type: 'DATA', hash, data } as LoginData);

    let confirmedHash = yield this.waitForHash.promise;

    if (hash !== confirmedHash) {
      throw new DataTransferFailed();
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
        throw new UnknownMessageError();
    }
  }
}
