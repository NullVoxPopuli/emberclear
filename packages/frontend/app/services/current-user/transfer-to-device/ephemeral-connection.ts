import Service, { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

import { toHex } from 'emberclear/utils/string-encoding';

import { Connection } from 'emberclear/services/connection/connection';

import Task from 'ember-concurrency/task';
import ArrayProxy from '@ember/array/proxy';
import Relay from 'emberclear/models/relay';
import StoreService from '@ember-data/store';
import TransferToDevice from 'emberclear/services/current-user/transfer-to-device';
import WorkersService from 'emberclear/services/workers';
import CryptoConnector from 'emberclear/services/workers/crypto';

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
  @service workers!: WorkersService;
  @service store!: StoreService;

  crypto?: CryptoConnector;

  @task(function*(this: EphemeralConnection) {
    this.hydrateCrypto();
    const keys = yield this.crypto!.generateKeys();

    this.hydrateCrypto(keys);

    let channelKey = `ect-${toHex(keys.publicKey)}`;

    // TODO: is it possible to re-use the existing connection pool?

    // TODO: copy / extract ConnectionManager#setup
    let relays = yield this.store.findAll('relay') as ArrayProxy<Relay>;

    yield this.createConnection(relays[0], channelKey);
    // TODO: figure out how to join additional channels
    //       or to create new connections outside the realm of a "service"
    //       see: ConnectionManager#createConnection

    // TODO if the transfer completes, return early

    yield timeout(EXPIRE_IN);

    // TODO: teardown the connection and destroy the crypto keys
  })
  start!: Task;

  // TODO: use @use/@resource?
  hydrateCrypto(user?: KeyPair) {
    if (this.crypto) {
      if (user) {
        this.crypto.keys = user;
      }

      return;
    }

    this.crypto = new CryptoConnector({
      workerService: this.workers,
      keys: user,
    });
  }

  // TODO: use @use/@resource?
  // ref: Connection/Manager
  private async createConnection(relay: Relay, channel: string) {
    let instance = new Connection({
      relay,
      publicKey: channel,
      onData: data => {
        console.debug('onData', data);
      },
      onInfo: info => {
        console.debug('onInfo', info);
      },
    });

    // Do connect / subscribe, etc
    await instance.connect();

    return instance;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'current-user/transfer-to-device/ephemeral-connection': TransferToDevice;
  }
}
