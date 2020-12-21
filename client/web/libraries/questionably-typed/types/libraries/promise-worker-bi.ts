declare module 'promise-worker-bi' {
  export class PWBWorker {
    register<T>(message: T): void;
  }

  // https://github.com/nolanlawson/promise-worker/blob/master/index.d.ts
  export class PWBHost {
    _worker: Worker;

    /**
     * Pass in the worker instance to promisify
     *
     * @param worker The worker instance to wrap
     */
    constructor(worker: Worker);

    register<T>(message: T): void;
    registerError<T>(message: T): void;

    /**
     * Send a message to the worker
     *
     * The message you send can be any object, array, string, number, etc.
     * Note that the message will be `JSON.stringify`d, so you can't send functions, `Date`s, custom classes, etc.
     *
     * @param userMessage Data or message to send to the worker
     * @returns Promise resolved with the processed result or rejected with an error
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public postMessage<TResult = any, TInput = any>(userMessage: TInput): Promise<TResult>;
  }
}
