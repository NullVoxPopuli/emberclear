import { PWBWorker } from 'promise-worker-bi';

import { handleMessage } from './messages';

import type { CryptoMessage } from './messages';

let promiseWorker = new PWBWorker();

promiseWorker.register(function (message: CryptoMessage) {
  return handleMessage(message);
});
