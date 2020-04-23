import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency-decorators';

import { taskFor } from 'emberclear/utils/ember-concurrency';

import Toast from 'emberclear/services/toast';
import SettingsService from 'emberclear/services/settings';
import RouterService from '@ember/routing/router-service';

import { EphemeralConnection } from '../ephemeral-connection';
import { UnknownMessageError } from '../../errors';

export class ReceiveDataConnection extends EphemeralConnection {
  @service router!: RouterService;
  @service settings!: SettingsService;
  @service toast!: Toast;
  @service intl!: Intl;

  waitForSYN = RSVP.defer<string>();
  waitForData = RSVP.defer<LoginData>();

  @action
  async wait() {
    this.waitForSYN = RSVP.defer();
    this.waitForData = RSVP.defer();

    await taskFor(this._wait).perform();
  }

  @dropTask
  *_wait() {
    let senderPublicKey = yield this.waitForSYN.promise;

    this.setTarget(senderPublicKey);

    yield this.send({ type: 'ACK' });

    let { hash, data } = yield this.waitForData.promise;

    let dataHash = '111'; // TODO implement this

    yield this.send({ type: 'HASH', data: dataHash });

    if (hash === dataHash) {
      yield this.settings.importData(data);

      this.toast.success(this.intl.t('ui.login.success'));
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
        throw new UnknownMessageError();
    }
  }
}
