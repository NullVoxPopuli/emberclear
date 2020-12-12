import { PWBWorker } from 'promise-worker-bi';

import { handleMessage } from './messages';

import type { CryptoMessage as Message } from './messages';

let promiseWorker = new PWBWorker();

promiseWorker.register(function (message: Message) {
  return handleMessage(message);
});
