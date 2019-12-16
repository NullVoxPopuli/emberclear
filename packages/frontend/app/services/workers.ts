import Service from '@ember/service';
import { action } from '@ember/object';
import { PWBHost } from 'promise-worker-bi';

export const CRYPTO_PATH = '/workers/crypto';
export const NETWORKING_PATH = '/workers/networking';

type WorkerRegistry = { [path: string]: PWBHost };

export default class WorkersService extends Service {
  registry: WorkerRegistry = {};

  @action
  getCryptoWorker() {
    return this.getWorker(CRYPTO_PATH);
  }

  @action
  getNetworkingWorker() {
    return this.getWorker(NETWORKING_PATH);
  }

  protected getWorker(path: string): PWBHost {
    if (this.registry[path]) return this.registry[path];

    let worker = new Worker(`${path}${window.ASSET_FINGERPRINT_HASH}.js`);
    let promiseWorker = new PWBHost(worker);
    // promiseWorker._hostIDQueue = undefined;

    if (!promiseWorker) {
      throw new Error('failed to create promiseWorker?');
    }

    promiseWorker.register(function(message: string) {
      console.info(`Received message in ${path}: `, message);
    });

    promiseWorker.registerError(function(err: any) {
      console.error(`Error in ${path}: `, err);
    });

    this.registry[path] = promiseWorker;

    return this.registry[path];
  }

  willDestroy() {
    Object.values(this.registry).forEach(promiseWorker => {
      promiseWorker._worker.terminate();
    });
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    workers: WorkersService;
  }
}
