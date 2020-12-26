import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import RSVP from 'rsvp';

import { EphemeralConnection } from '@emberclear/networking';
import {
  CurrentUserMustHaveAName,
  DataTransferFailed,
  UnknownMessageError,
} from '@emberclear/networking/errors';

import type { EncryptedMessage } from '@emberclear/crypto/types';
import type { CurrentUserService } from '@emberclear/local-account';
import type SettingsService from 'emberclear/services/settings';

export class SendDataConnection extends EphemeralConnection {
  @service declare settings: SettingsService;
  @service declare currentUser: CurrentUserService;

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
  async _establishContact() {
    if (!this.currentUser.name) {
      throw new CurrentUserMustHaveAName();
    }

    await this.send({ type: 'SYN', data: { id: this.hexId, name: this.currentUser.name } });
    await this.waitForACK.promise;
  }

  @dropTask
  async _transferToDevice() {
    let data = await this.settings.buildSettings();
    let hash = '111'; // TODO: implement this

    await this.send({ type: 'DATA', hash, data } as LoginData);

    let confirmedHash = await this.waitForHash.promise;

    if (hash !== confirmedHash) {
      throw new DataTransferFailed();
    }
  }

  @action
  async onData(data: EncryptedMessage) {
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
