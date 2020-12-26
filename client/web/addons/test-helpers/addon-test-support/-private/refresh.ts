import { currentURL, getContext, setupContext, teardownContext } from '@ember/test-helpers';

import { visit } from './visit';

export async function refresh<T = unknown>(mocking: () => T | Promise<T>) {
  const url = currentURL();
  const ctx = getContext();

  await teardownContext(ctx);
  await setupContext(ctx);
  await mocking();
  await visit(url);
}
