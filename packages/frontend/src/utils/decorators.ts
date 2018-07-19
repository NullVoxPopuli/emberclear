import { assert } from '@ember/debug';

export function disableInFastboot<T>(defaultValue: T) {
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const oldGet = descriptor.get;

    descriptor.get = function(): T {
      const fb = this.fastboot;

      assert(`
        The FastBoot service must be present under the name 'fastboot'.
        Did you inject it?`, fb);

      if (fb.isFastBoot) return defaultValue;

      return oldGet();
    }
  }
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
