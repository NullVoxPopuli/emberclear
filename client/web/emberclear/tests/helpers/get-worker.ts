import { getContext } from '@ember/test-helpers';

export function getWorker(name: string /* TODO: worker names */) {
  let { owner } = getContext();

  return owner.lookup('service:-workers').getWorker(name);
}
