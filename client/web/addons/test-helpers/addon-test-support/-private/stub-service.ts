import Service from '@ember/service';
import { getContext } from '@ember/test-helpers';

import type { Registry } from '@ember/service';
import type { TestContext } from 'ember-test-helpers';

export const stubService = (name: keyof Registry, hash = {}) => {
  let stubbedService;

  // TODO: need to be able to use an extended service that uses services. :)
  if (hash instanceof Function) {
    stubbedService = hash;
  } else {
    stubbedService = Service.extend(hash);
  }

  let { owner } = getContext() as TestContext;
  let serviceName = `service:${name}`;

  owner.register(serviceName, stubbedService);
};

export default stubService;
