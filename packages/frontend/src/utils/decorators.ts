import { PromiseMonitor } from 'ember-computed-promise-monitor';

export function syncToLocalStorage<T>(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const targetName = target.constructor.name;
  const key = `${targetName}-${propertyKey}`;

  descriptor.get = (): T => {
    const lsValue = localStorage.getItem(key);
    const json = (lsValue && JSON.parse(lsValue)) || {};

    return json.value;
  };

  descriptor.set = (value) => {
    const lsValue = JSON.stringify({ value });

    localStorage.setItem(key, lsValue);
  };
}

export function monitor<T = any>(_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
  const { get: oldGet } = descriptor;
  // TODO: assert that a getter exists
  // TODO: assert that a setter does not exist

  descriptor.get = function(): any {
    const promise = oldGet!.apply(this);

    return new PromiseMonitor<T>(promise);
  };

  descriptor.set = (/* value */) => {
    throw new Error('a monitored property cannot be set');
  };

  return descriptor;
}
