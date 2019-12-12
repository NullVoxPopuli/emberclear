import { tracked } from '@glimmer/tracking';

export function inLocalStorage<T = boolean>(
  target: object,
  propertyKey: string,
  // descriptor is undefined for properties
  // it's only available on methods and such
  descriptor?: any
): void /* TS says the return value is ignored... idk if I believe it */ {
  const targetName = target.constructor.name;
  const { get: oldGet, set: oldSet } = (tracked as any)(target, propertyKey, descriptor) as any;

  const newDescriptor = {
    configurable: true,
    enumerable: true,
    get: function(): T {
      const key = `${targetName}-${propertyKey}`;
      const initialValue = oldGet!.call(this);
      const lsValue = localStorage.getItem(key);
      const json = (lsValue && JSON.parse(lsValue)) || { value: initialValue };

      return json.value;
    },
    set: function(value: T) {
      const key = `${targetName}-${propertyKey}`;
      const lsValue = JSON.stringify({ value });

      localStorage.setItem(key, lsValue);

      // this is required to dirty the change tracking system
      oldSet!.call(this, value);
    },
  };

  return newDescriptor as any;
}

type Teardown = () => void;
type Setup = () => Teardown | void;
type Effect = Setup;

/**
 * wraps setup and teardown so we don't need to separate setup and teardown
 * in the constructor and willDestroy hook for components/services, etc
 *
 * NOTE: only tested on services for now. I don't know if all destroyable things
 *       use the same "willDestroy"-named hook.
 */
export function useEffect(target: any, _propertyKey: string, descriptor?: any) {
  const { value: fn } = descriptor;

  const { init: oldInit, willDestroy: oldWillDestroy } = target;

  let callback: Effect = fn;

  target.init = function() {
    oldInit.call(target);
    callback = callback.call(target);
  };

  target.willDestroy = function() {
    if (callback) {
      callback.call(target);
    }

    oldWillDestroy.call(target);
  };
}
