import { setupContext, teardownContext, getContext, currentURL } from '@ember/test-helpers';
import { visit } from './index';

export async function refresh(mocking: () => void = () => undefined) {
  const url = currentURL();
  const ctx = getContext();
  await teardownContext(ctx);
  await setupContext(ctx);
  await mocking();
  await visit(url);
}
