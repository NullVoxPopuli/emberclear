import { assert } from '@ember/debug';
import { get, notifyPropertyChange } from '@ember/object';

interface WhyCantTSGetDecoratorsRight<InitializedValue> {
  initializer?: () => InitializedValue;
}

/**
 * Kinda Pre-stage 2 decorator.
 *
 * Will need to update when decorators hit stage 3
 *
 */
// TODO: figure out a better default type for Klass
// eslint-disable-next-line @typescript-eslint/ban-types
export function inLocalStorage<T = boolean, Klass extends Object = Object>(
  target: Klass,
  propertyKey: keyof Klass,
  // descriptor is undefined for properties
  // it's only available on methods and such
  descriptor?: WhyCantTSGetDecoratorsRight<T>
): void /* TS says the return value is ignored... idk if I believe it */ {
  let targetName = target.constructor.name;

  assert(`@inLocalStorage is only usable on class properties`, descriptor);

  let { initializer } = descriptor;

  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    get: function (this: Klass): T {
      let key = `${targetName}-${propertyKey}`;
      const lsValue = localStorage.getItem(key);
      const value = (lsValue && JSON.parse(lsValue))?.value || initializer?.();

      // Entagle with tracking system
      // This is a bit of a hack and the returned value doesn't matter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(this, key as any);

      return value;
    },
    set: function (value: T) {
      const key = `${targetName}-${propertyKey}`;
      const lsValue = JSON.stringify({ value });

      localStorage.setItem(key, lsValue);

      // this is required to dirty the change tracking system
      notifyPropertyChange(this, key);
    },
  };

  // I think TypeScript is wrong when it comes to decorators...
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return newDescriptor as any;
}
