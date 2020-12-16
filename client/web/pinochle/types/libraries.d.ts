
declare module 'tracked-maps-and-sets' {
  export class TrackedMap<K, V> extends Map<K, V> {}
  export class TrackedWeakMap<K extends object, V> extends WeakMap<K, V> {}
  export class TrackedSet<T> extends Set<T> {}
  export class TrackedWeakSet<T extends object> extends WeakSet<T> {}
}

declare module 'focus-visible' {}

declare module 'ember-could-get-used-to-this' {
  export function use(): PropertyDecorator;
  export class Resource<Args> {
    constructor(owner: unknown, args: Args);
  }
}
