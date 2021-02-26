import { getOwner, setOwner } from '@ember/application';
import { assert } from '@ember/debug';
import {
  associateDestroyableChild,
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable';
import { inject as service } from '@ember/service';

import { CryptoConnector } from '@emberclear/crypto';
import { fromHex, toHex } from '@emberclear/encoding/string';
import { Connection } from '@emberclear/networking';
import { defaultRelays } from '@emberclear/networking/required-data';
import { pool } from '@emberclear/networking/utils/connection/connection-pool';

import type StoreService from '@ember-data/store';
import type { WorkersService } from '@emberclear/crypto';
import type { EncryptableObject, EncryptedMessage, KeyPair } from '@emberclear/crypto/types';
import type { EndpointInfo } from '@emberclear/networking/types';
import type {
  ConnectionPool,
  STATUS,
} from '@emberclear/networking/utils/connection/connection-pool';

type Target = {
  pub: Uint8Array;
  hex: string;
};

const DEFAULT_GETTER = () => defaultRelays;

export type GetEndpoints = () => EndpointInfo[] | Promise<EndpointInfo[]>;

export interface Options {
  getEndpoints?: GetEndpoints | undefined;
  publicKeyAsHex?: string | undefined;
  keys?: KeyPair | undefined;
}

export class EphemeralConnection {
  @service declare store: StoreService;
  @service declare workers: WorkersService;

  // setup in the psuedo constructor (static method: build)
  // (build is an "async constructor")
  declare connectionPool: ConnectionPool<Connection>;
  declare crypto: CryptoConnector;
  declare hexId: string;

  /**
   * Static information about who we're connecting to
   * - useful if the connection is only meant for one person
   */
  declare target?: Target;

  getEndpoints: GetEndpoints = () => [];

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
    // eslint-disable-next-line @typescript-eslint/ban-types
    parent: object,
    options?: Options
  ): Promise<SubClass> {
    let { getEndpoints, publicKeyAsHex, keys } = options || {};
    let instance = new this(publicKeyAsHex);

    setOwner(instance, getOwner(parent));
    associateDestroyableChild(parent, instance);
    registerDestructor(instance, instance.teardown.bind(instance));

    await instance.hydrateCrypto(keys);
    assert('Crypto failed to initialize', instance.crypto);
    assert('Failed to generate an ephemeral identifier', instance.hexId);

    instance.getEndpoints = getEndpoints || DEFAULT_GETTER;

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

  setCrypto(keys: KeyPair) {
    this.crypto.keys = keys;
    this.hexId = toHex(keys.publicKey);
  }

  disconnect() {
    if (this.connectionPool) {
      this.connectionPool.drain();
    }
  }

  teardown() {
    this.disconnect();
  }

  onData(_data: EncryptedMessage) {
    throw new Error('onData must be overridden in a subclass');
  }

  ///////////////////////////////////////

  async hydrateCrypto(keys?: KeyPair) {
    let { hex, crypto } = await generateEphemeralKeys(this.workers, keys);

    if (isDestroying(this) || isDestroyed(this)) return;

    this.crypto = crypto;
    this.hexId = hex;
  }

  sendToHex(message: EncryptableObject, hexPub: string) {
    let pub = fromHex(hexPub);

    return this.send(message, { hex: hexPub, pub });
  }

  async send(message: EncryptableObject, target?: Target) {
    if (isDestroying(this) || isDestroyed(this)) return;

    let _target = this.target || target;

    if (!_target) {
      throw new Error('Cannot send a message with no target');
    }

    if (!this.connectionPool) {
      await this.establishConnection();

      if (isDestroying(this) || isDestroyed(this)) return;
      // throw new Error('Cannot send a message with no connection to the target');
    }

    let to = _target.pub;
    let connection = await this.connectionPool.acquire();

    if (isDestroying(this) || isDestroyed(this)) return;

    let encryptedMessage = await this.crypto.encryptForSocket({ ...message }, { publicKey: to });

    if (isDestroying(this) || isDestroyed(this)) return;

    await connection.send({ to: toHex(to), message: encryptedMessage });
  }

  async establishConnection() {
    if (this.connectionPool) return;

    if (isDestroying(this) || isDestroyed(this)) return;

    this.connectionPool = await pool<Connection>({
      endpoints: await this.getEndpoints(),
      create: createConnection.bind(null, this.hexId, this.onData),
      destroy: (instance) => instance.destroy(),
      isOk: (instance) => instance.isConnected,
      onStatusChange: (status: STATUS) => console.info({ status }),
      minConnections: 1,
    });
  }
}

async function generateEphemeralKeys(workers: WorkersService, keys?: KeyPair) {
  let crypto = new CryptoConnector({ workerService: workers });

  if (!keys) {
    keys = await crypto.generateKeys();
  }

  crypto.keys = keys;

  let hex = toHex(keys.publicKey);

  return { hex, crypto, ...keys };
}

async function createConnection(
  publicKey: string,
  onData: (data: EncryptedMessage) => void,
  relay: EndpointInfo
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
