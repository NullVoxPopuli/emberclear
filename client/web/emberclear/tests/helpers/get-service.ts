import { getContext } from '@ember/test-helpers';
import { Registry } from '@ember/service';

export function getService<K extends keyof Registry>(name: K): Registry[K] {
  const { owner } = getContext() as any;

  const service = owner.lookup(`service:${name}`);

  return service as Registry[K];
}
