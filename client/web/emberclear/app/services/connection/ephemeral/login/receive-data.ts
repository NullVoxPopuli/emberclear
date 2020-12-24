import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import RSVP from 'rsvp';

import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import type RouterService from '@ember/routing/router-service';
import type { EncryptedMessage } from '@emberclear/crypto/types';
import type SettingsService from 'emberclear/services/settings';
import type Toast from 'emberclear/services/toast';

type UpdateStatus = (status: boolean) => void;

export class ReceiveDataConnection extends EphemeralConnection {
  @service declare router: RouterService;
  @service declare settings: SettingsService;
  @service declare toast: Toast;
  @service declare intl: Intl;

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
  async _wait(updateTransferStatus: UpdateStatus) {
    let { id: senderPublicKey, name } = await this.waitForSYN.promise;

    this.senderName = name;
    this.taskMsg = this.intl.t('ui.login.verify.received');

    updateTransferStatus(true);

    this.setTarget(senderPublicKey);

    await this.send({ type: 'ACK' });
    this.taskMsg = this.intl.t('ui.login.verify.waitingOnApproval');

    let { hash, data } = await this.waitForData.promise;

    this.taskMsg = this.intl.t('ui.login.verify.receivedData');

    let dataHash = '111'; // TODO implement this

    await this.send({ type: 'HASH', data: dataHash });

    if (hash === dataHash) {
      this.taskMsg = this.intl.t('ui.login.verify.importing');

      await this.settings.importData(data);

      this.taskMsg = '';
      await this.toast.success(this.intl.t('ui.login.success'));
      await this.router.transitionTo('chat');

      updateTransferStatus(false);

      return;
    }

    this.taskMsg = this.intl.t('ui.login.verify.failed');
    updateTransferStatus(false);
  }

  @action
  async onData(data: EncryptedMessage) {
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
