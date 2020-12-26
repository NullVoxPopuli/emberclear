import { visit as dangerousVisit } from '@ember/test-helpers';

export async function visit(url: string) {
  try {
    await dangerousVisit(url);
  } catch (e) {
    if (!e.message.includes('TransitionAborted')) {
      throw e;
    }
  }
}
