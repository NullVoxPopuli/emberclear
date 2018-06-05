import Service from '@ember/service';
import { getContext } from '@ember/test-helpers';

export const stubService = (name: string, hash = {}) => {
  let stubbedService = Service.extend(hash);

  let { owner } = getContext();
  owner.register(`service:${name}`, stubbedService)
};

export default stubService;
