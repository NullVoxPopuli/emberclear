declare module 'ember-concurrency-decorators' {
  interface ConcurrencyOptions {
    maxConcurrency?: number;
    group?: string;
    keepLatest?: boolean;
    cancelOn?: string;
    on?: string;
  }

  type Decorated =
    IterableIterator<Promise<void>>
    & { perform: (args?: any[]) => any; };

  // export const task: (options?: ConcurrencyOptions) => Decorated;
  // export const dropTask: (fn: any) => Decorated;

  export const task: any;
  export const dropTask: any;
}
