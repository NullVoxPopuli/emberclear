import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency-decorators';

import { taskFor } from 'emberclear/utils/ember-concurrency';

import { EphemeralConnection } from '../ephemeral-connection';
import { UnknownMessageError, DataTransferFailed } from 'emberclear/utils/errors';
import CurrentUserService from 'emberclear/services/current-user';
import { CurrentUserMustHaveAName } from 'emberclear/utils/errors';

export class SendDataConnection extends EphemeralConnection {
  @service currentUser!: CurrentUserService;

  waitForACK = RSVP.defer<void>();
  waitForHash = RSVP.defer<string>();

  @action
  establishContact() {
    this.waitForACK = RSVP.defer();

    return taskFor(this._establishContact).perform();
  }

  @action
  transferToDevice() {
    this.waitForHash = RSVP.defer();

    return taskFor(this._transferToDevice).perform();
  }

  @dropTask
  *_establishContact() {
    if (!this.currentUser.name) {
      throw new CurrentUserMustHaveAName();
    }

    yield this.send({ type: 'SYN', data: { id: this.hexId, name: this.currentUser.name } });
    yield this.waitForACK.promise;
  }

  @dropTask
  *_transferToDevice() {
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
