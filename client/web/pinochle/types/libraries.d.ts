
declare module 'tracked-maps-and-sets' {
  export class TrackedMap<K, V> extends Map<K, V> {}
  export class TrackedWeakMap<K extends object, V> extends WeakMap<K, V> {}
  export class TrackedSet<T> extends Set<T> {}
  export class TrackedWeakSet<T extends object> extends WeakSet<T> {}
}

declare module 'focus-visible' {}

type LazyTrackedArgs = {
  positional?: Array<unknown>;
  named?: Record<string, unknown>;
}

declare module 'ember-could-get-used-to-this' {
  export const use: PropertyDecorator;
  export class Resource<Args extends LazyTrackedArgs> {
    protected args: Args;

    // This is a lie, but makes the call site nice
    constructor(fn: () => Args['positional'] | Args);
  }
}

declare module 'ember-concurrency-test-waiter/define-modifier' {
  const foo: any;
  export default foo;
}

declare module 'ember-raf-scheduler/test-support/register-waiter' {
  const foo: any;
  export default foo;
}
