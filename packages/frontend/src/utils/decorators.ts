import { getOwner } from '@ember/application';
import { decoratorWithParams } from '@ember-decorators/utils/decorator';

function isFastBoot(context) {
  const service = getOwner(context).lookup('service:fastboot');

  return service.isFastBoot;
}

export const disableInFastboot = decoratorWithParams(_disableInFastboot);

export function _disableInFastboot<T>(_target: any, _propertyKey: string, descriptor: PropertyDescriptor, params: any[]) {
  const options = params[0] || {};
  const fbReturn = options.default;
  const { get: oldGet, value: oldValue } = descriptor;

  if (oldValue) {
    descriptor.value = function(...args: any[]): T {
      if (isFastBoot(this)) return fbReturn;

      return oldValue.apply(this, args);
    }

    return descriptor;
  }

  if (oldGet) {
    descriptor.get = function(): T | undefined {
      if (isFastBoot(this)) return fbReturn;

      return oldGet();
    }
  }

  return descriptor;
}

export function syncToLocalStorage<T>(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const targetName = target.constructor.name;
  const key = `${targetName}-${propertyKey}`;

  descriptor.get = (): T => {
    const lsValue = localStorage.getItem(key);
    const json = (lsValue && JSON.parse(lsValue)) || {};

    return json.value;
  }

  descriptor.set = (value) => {
    const lsValue = JSON.stringify({ value });

    localStorage.setItem(key, lsValue);
  }
}
