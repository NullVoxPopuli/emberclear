type Args = {
  workerService: WorkersService;
  keys?: KeyPair;
};

/**
 * This class is primarly a delegator.
 *
 * Bundles cryptographic behaviors with a given NaCl Box KeyPair.
 *
 *
 */
export default class CryptoConnector {
  worker: unknown;
  keys: KeyPair;

  constructor({ workerService, keys }: Args) {
    let { privateKey, publicKey } = keys || ({} as KeyPair);

    this.worker = workerService;
    this.keys = { privateKey, publicKey };
  }

  async login(mnemonic: string) {
    return await this.worker.login(mnemonic);
  }

  async mnemonicFromNaClBoxPrivateKey(key?: Uint8Array) {
    return this.worker.mnemonicFromPrivateKey(key || this.keys.privateKey);
  }

  async generateKeys() {
    return this.worker.generateKeys();
  }

  async generateSigningKeys() {
    return this.worker.generateSigningKeys();
  }

  async derivePublicKey(privateKey: Uint8Array) {
    return this.worker.derivePublicKey(privateKey);
  }

  async derivePublicSigningKey(privateSigningKey: Uint8Array) {
    return this.worker.derivePublicSigningKey(privateSigningKey);
  }

  async encryptForSocket(payload: RelayJson, { publicKey }: KeyPublic) {
    return this.worker.encryptForSocket(
      payload,
      { publicKey },
      { privateKey: this.keys.privateKey }
    );
  }

  async decryptFromSocket<ExpectedReturn = unknown>(socketData: RelayMessage) {
    return this.worker.decryptFromSocket(socketData, this.keys.privateKey) as ExpectedReturn;
  }

  async sign(message: Uint8Array, senderPrivateKey: Uint8Array) {
    return this.worker.sign(message, senderPrivateKey);
  }

  async openSigned(signedMessage: Uint8Array, senderPublicKey: Uint8Array) {
    return this.worker.openSigned(signedMessage, senderPublicKey);
  }

  async hash(message: Uint8Array) {
    return this.worker.hash(message);
  }
}
