import type { handleMessage } from '../workers/crypto/messages';

export interface WorkerLike {
  postMessage: typeof handleMessage;
  _worker?: Worker;
}

export type WorkerRegistry = { [path: string]: WorkerLike };
