// import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { setOwner, getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { associateDestroyableChild, registerDestructor } from '@ember/destroyable';

import type { STATUS, ConnectionPool } from 'emberclear/utils/connection/connection-pool';
import { pool } from 'emberclear/utils/connection/connection-pool';
import { toHex, fromHex } from 'emberclear/utils/string-encoding';
import { Connection } from 'emberclear/utils/connection/connection';
import CryptoConnector from 'emberclear/utils/workers/crypto';

import type Relay from 'emberclear/models/relay';
import type StoreService from '@ember-data/store';
import type WorkersService from 'emberclear/services/workers';
import type SettingsService from 'emberclear/services/settings';

export class EphemeralConnection {
  @service store!: StoreService;
  @service workers!: WorkersService;
  @service settings!: SettingsService;

  // setup in the psuedo constructor (static method: build)
  // (build is an "async constructor")
  connectionPool!: ConnectionPool<Connection, Relay>;
  crypto!: CryptoConnector;
  hexId!: string;

  // Static information about who we're connecting to
  target?: {
    pub: Uint8Array;
    hex: string;
  };

  /**
   * For creating new instances of ephemeral connections
   * within ember apps.
   * ( requires on object with an owner and is destroyable )
   *
   * This is deliberately not called create, because
   * this should not be called be the Ember D.I. System
   * as creation of these instances is *async*... and async
   * constructors don't exist.
   *
   * Additionally, it has a different signature.
   * There is no "automatic" way to have a destroyable created,
   * so given a "caller", we can register the destructor.
   *
   * When this method finishes running, you will have
   * - public/private keys
   * - a new connection(pool) to the relays
   *
   * @param parent Ember Container Object (must be destroyable)
   * @param publicKeyAsHex string
   */
  static async build<SubClass extends EphemeralConnection>(
    /* hack to get inheritence in static methods */
    this: { new (hex?: string): SubClass },
    /* the actual params to this method */
    parent: unknown,
    publicKeyAsHex?: string
  ): Promise<SubClass> {
    let instance = new this(publicKeyAsHex);

    setOwner(instance, getOwner(parent));
    associateDestroyableChild(parent, instance);
    registerDestructor(instance, instance.teardown.bind(instance));

    await instance.hydrateCrypto();
    assert('Crypto failed to initialize', instance.crypto);
    assert('Failed to generate an ephemeral identifier', instance.hexId);

    await instance.establishConnection();
    assert('Connection Pool failed to be set up', instance.connectionPool);

    return instance;
  }

  constructor(publicKeyAsHex?: string) {
    this.setTarget(publicKeyAsHex);
  }

  setTarget(publicKeyAsHex?: string) {
    if (publicKeyAsHex) {
      this.target = {
        pub: fromHex(publicKeyAsHex),
        hex: publicKeyAsHex,
      };
    }
  }

  disconnect() {
    if (this.connectionPool) {
      this.connectionPool.drain();
    }
  }

  teardown() {
    this.disconnect();
  }

  onData(_data: RelayMessage) {
    throw new Error('onData must be overridden in a subclass');
  }

  ///////////////////////////////////////

  async hydrateCrypto() {
    let { hex, crypto } = await generateEphemeralKeys(this.workers);

    this.crypto = crypto;
    this.hexId = hex;
  }

  async send(message: RelayJson) {
    if (!this.target) {
      throw new Error('Cannot send a message with no target');
    }

    let to = this.target.pub;
    let connection = await this.connectionPool.acquire();
    let encryptedMessage = await this.crypto.encryptForSocket({ ...message }, { publicKey: to });

    await connection.send({ to: toHex(to), message: encryptedMessage });
  }

  async establishConnection() {
    let relays = await this.store.findAll('relay');

    this.connectionPool = await pool<Connection, Relay>({
      endpoints: relays.toArray(),
      create: createConnection.bind(null, this.hexId, this.onData),
      destroy: (instance) => instance.destroy(),
      isOk: (instance) => instance.isConnected,
      onStatusChange: (status: STATUS) => console.info({ status }),
      minConnections: 1,
    });
  }
}

async function generateEphemeralKeys(workers: WorkersService) {
  let crypto = new CryptoConnector({ workerService: workers });
  let keys = await crypto.generateKeys();

  crypto.keys = keys;

  let hex = toHex(keys.publicKey);

  return { hex, crypto, ...keys };
}

async function createConnection(
  publicKey: string,
  onData: (data: RelayMessage) => void,
  relay: Relay
) {
  let instance = new Connection({
    relay,
    onData,
    publicKey,
    onInfo: (_info) => ({}),
  });

  await instance.connect();

  return instance;
}
