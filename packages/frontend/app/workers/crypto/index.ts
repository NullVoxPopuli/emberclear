import { PWBWorker } from 'promise-worker-bi';
import { handleMessage } from './messages';

type Message = import('./messages').CryptoMessage;

let promiseWorker = new PWBWorker();

promiseWorker.register(function(message: Message) {
  return handleMessage(message);
});
