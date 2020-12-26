import { getContext } from '@ember/test-helpers';

import type { Registry } from '@ember/service';
import type { TestContext } from 'ember-test-helpers';

export function getService<K extends keyof Registry>(name: K): Registry[K] {
  const { owner } = getContext() as TestContext;

  const service = owner.lookup(`service:${name}`);

  return service as Registry[K];
}
