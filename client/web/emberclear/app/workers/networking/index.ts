import { PWBWorker } from 'promise-worker-bi';

let promiseWorker = new PWBWorker();

promiseWorker.register(function (message: any) {
  console.info(message);

  return 'pong';
});
