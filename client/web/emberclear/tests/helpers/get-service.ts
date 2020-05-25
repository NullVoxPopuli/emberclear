import { getContext } from '@ember/test-helpers';
import { Registry } from '@ember/service';

export function getService<K extends keyof Registry>(name: K): Registry[K] {
  const { owner } = getContext();

  const service = owner.lookup<Registry[K]>(`service:${name}`);

  return service;
}
