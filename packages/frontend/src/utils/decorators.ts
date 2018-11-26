import { getOwner } from '@ember/application';
import { decoratorWithParams } from '@ember-decorators/utils/decorator';
import { PromiseMonitor } from 'ember-computed-promise-monitor';

function isFastBoot(context: any) {
  const service = getOwner(context).lookup('service:fastboot');

  return service.isFastBoot;
}

interface IDecorator {
  descriptor: PropertyDescriptor;
  key: string;
  kind: string;
  placement: string;
}

export const disableInFastboot = decoratorWithParams(function<T>({ descriptor }: IDecorator, params: any)  {
  const options = params && params[0] || {};
  const fbReturn = options.default;
  const { get: oldGet, value: oldValue } = descriptor;

  if (oldValue) {
    descriptor.value = function(...args: any[]): T {
      if (isFastBoot(this)) return fbReturn;

      return oldValue.apply(this, args);
    };

    return descriptor;
  }

  if (oldGet) {
    descriptor.get = function(): T | undefined {
      if (isFastBoot(this)) return fbReturn;

      return oldGet.apply(this);
    };
  }

  return descriptor;
});

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
