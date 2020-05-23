import RSVP from 'rsvp';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency-decorators';

import { taskFor } from 'emberclear/utils/ember-concurrency';

import Toast from 'emberclear/services/toast';
import SettingsService from 'emberclear/services/settings';
import RouterService from '@ember/routing/router-service';

import { EphemeralConnection } from '../ephemeral-connection';
import { UnknownMessageError } from 'emberclear/utils/errors';

type UpdateStatus = (status: boolean) => void;

export class ReceiveDataConnection extends EphemeralConnection {
  @service router!: RouterService;
  @service settings!: SettingsService;
  @service toast!: Toast;
  @service intl!: Intl;

  waitForSYN = RSVP.defer<PublicIdentity>();
  waitForData = RSVP.defer<LoginData>();

  @tracked taskMsg = '';
  @tracked senderName = '';

  @action
  wait(updateTransferStatus: UpdateStatus) {
    this.waitForSYN = RSVP.defer();
    this.waitForData = RSVP.defer();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this._wait).perform(updateTransferStatus);
  }

  @dropTask
  *_wait(updateTransferStatus: UpdateStatus) {
    let { id: senderPublicKey, name } = yield this.waitForSYN.promise;

    this.senderName = name;
    this.taskMsg = this.intl.t('ui.login.verify.received');

    updateTransferStatus(true);

    this.setTarget(senderPublicKey);

    yield this.send({ type: 'ACK' });
    this.taskMsg = this.intl.t('ui.login.verify.waitingOnApproval');

    let { hash, data } = yield this.waitForData.promise;
    this.taskMsg = this.intl.t('ui.login.verify.receivedData');

    let dataHash = '111'; // TODO implement this

    yield this.send({ type: 'HASH', data: dataHash });

    if (hash === dataHash) {
      this.taskMsg = this.intl.t('ui.login.verify.importing');

      yield this.settings.importData(data);

      this.taskMsg = '';
      yield this.toast.success(this.intl.t('ui.login.success'));
      this.router.transitionTo('chat');

      updateTransferStatus(false);
      return;
    }

    this.taskMsg = this.intl.t('ui.login.verify.failed');
    updateTransferStatus(false);
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
