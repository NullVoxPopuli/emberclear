import { getContext } from '@ember/test-helpers';

export function getService<T>(name: string): T {
  const { owner } = getContext();

  const service = owner.lookup(`service:${name}`);

  return service;
}
