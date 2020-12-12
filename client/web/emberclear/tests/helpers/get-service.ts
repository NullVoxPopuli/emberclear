import { getContext } from '@ember/test-helpers';
import type { Registry } from '@ember/service';

// have to import files that aren't imported elsewhere
// these should be periodically checked to see if they can be removed
import 'emberclear/services/redirect-manager';
import 'emberclear/services/chat-scroller';

export function getService<K extends keyof Registry>(name: K): Registry[K] {
  const { owner } = getContext() as any;

  const service = owner.lookup(`service:${name}`);

  return service as Registry[K];
}
