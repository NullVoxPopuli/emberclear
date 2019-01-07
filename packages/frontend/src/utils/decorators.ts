import { PromiseMonitor } from 'ember-computed-promise-monitor';

// https://tc39.github.io/proposal-decorators/#sec-elementdescriptor-specification-type
interface ElementDescriptor {
  descriptor: PropertyDescriptor;
  initializer?: () => any; // unknown
  key: string;
  kind: 'method' | 'field' | 'initializer';
  placement: 'own' | 'prototype' | 'static';
  finisher?: (klass: any) => any;
}

interface MethodDecorator {
  descriptor: PropertyDescriptor;
  key: string;
  kind: 'method' | 'field' | 'initializer';
  placement: 'own' | 'prototype' | 'static';
}

export function syncToLocalStorage<T>(desc: MethodDecorator): ElementDescriptor {
  const result: ElementDescriptor = {
    ...desc,
    kind: 'method',
    descriptor: {
      enumerable: false,
      configurable: false,
    },
  };

  result.descriptor.get = function(): T {
    const key = `${this.constructor.name}-${desc.key}`;
    const lsValue = localStorage.getItem(key);
    const json = (lsValue && JSON.parse(lsValue)) || {};

    return json.value;
  };
  result.descriptor.set = function(value: any) {
    const key = `${this.constructor.name}-${desc.key}`;
    const lsValue = JSON.stringify({ value });

    localStorage.setItem(key, lsValue);
  };

  return result;
}

export function monitor<T = any>(desc: ElementDescriptor) {
  const { descriptor } = desc;
  const { get: oldGet } = descriptor;

  return {
    ...desc,
    kind: 'method',
    descriptor: {
      ...desc.descriptor,

      get() {
        const promise = oldGet!.apply(this);

        return new PromiseMonitor<T>(promise);
      },
    },
  };
}
