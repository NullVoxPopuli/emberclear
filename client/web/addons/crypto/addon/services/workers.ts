import { action } from '@ember/object';
import Service from '@ember/service';

import { PWBHost } from 'promise-worker-bi';

import type { WorkerLike, WorkerRegistry } from '@emberclear/crypto/-private/types';

export const CRYPTO_PATH = '/workers/crypto';
export const NETWORKING_PATH = '/workers/networking';

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

  protected getWorker(path: string): WorkerLike {
    if (this.registry[path]) return this.registry[path];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let worker = new Worker(`${path}${(window as any).ASSET_FINGERPRINT_HASH || ''}.js`);
    let promiseWorker = new PWBHost(worker);
    // promiseWorker._hostIDQueue = undefined;

    if (!promiseWorker) {
      throw new Error('failed to create promiseWorker?');
    }

    promiseWorker.register(function (message: string) {
      console.info(`Received message in ${path}: `, message);
    });

    promiseWorker.registerError(function (err: Error) {
      console.error(`Error in ${path}: `, err);
    });

    this.registry[path] = promiseWorker as WorkerLike;

    return this.registry[path];
  }

  willDestroy() {
    Object.values(this.registry).forEach((promiseWorker) => {
      promiseWorker._worker?.terminate();
    });
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    workers: WorkersService;
  }
}
