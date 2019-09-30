import Service from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import Task from 'ember-concurrency/task';
import {generateAsymmetricKeys} from 'emberclear/utils/nacl/utils';
import {toHex} from 'emberclear/utils/string-encoding';
import TransferToDevice from 'emberclear/services/current-user/transfer-to-device';

const EXPIRE_IN = 300000; // five minutes

/**
 * Responsible for maintaining the connection,
 * ephemeral private key, and expiring everything on
 * a set interval.
 *
 * TODO: investigate whether or not it makes sense for this
 *       to be a non-ember entity if/when ember-concurrency
 *       can be used outside of an ember-context.
 *
 * TODO: I think it would make sense to spin this up in a worker,
 *       so the entirety of encryption, websocket stuff, etc
 *       can be managed via worker.
 *
 */
export default class EphemeralConnection extends Service {
  private privateKey?: Uint8Array;
  private publicKey?: Uint8Array;
  private channelKey?: string;

  @(task(function*(this: EphemeralConnection) {
    yield this.generateKeys();

  })) start!: Task;

  private async generateKeys() {
    let keyPair = await generateAsymmetricKeys();

    this.privateKey = keyPair.privateKey;
    this.publicKey = keyPair.publicKey;
    this.channelKey = `ect-${toHex(this.publicKey)}`;
  }

}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'current-user/transfer-to-device/ephemeral-connection': TransferToDevice;
  }
}
