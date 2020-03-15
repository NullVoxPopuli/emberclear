import { get, notifyPropertyChange } from '@ember/object';

export function inLocalStorage<T = boolean>(
  target: object,
  propertyKey: string,
  // descriptor is undefined for properties
  // it's only available on methods and such
  descriptor?: any
): void /* TS says the return value is ignored... idk if I believe it */ {
  let targetName = target.constructor.name;
  let { initializer } = descriptor;

  const newDescriptor = {
    configurable: true,
    enumerable: true,
    get: function(): T {
      let key = `${targetName}-${propertyKey}`;
      const lsValue = localStorage.getItem(key);
      const value = (lsValue && JSON.parse(lsValue))?.value || initializer?.();

      // Entagle with tracking system
      get(this as any, key);

      return value;
    },
    set: function(value: T) {
      const key = `${targetName}-${propertyKey}`;
      const lsValue = JSON.stringify({ value });

      localStorage.setItem(key, lsValue);

      // this is required to dirty the change tracking system
      notifyPropertyChange(this, key);
    },
  };

  return newDescriptor as any;
}
