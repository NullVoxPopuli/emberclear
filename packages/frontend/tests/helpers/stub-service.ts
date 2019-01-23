import Service from '@ember/service';
import { getContext } from '@ember/test-helpers';

interface IInjection {
  in: string;
  as: string;
}

export const stubService = (name: string, hash = {}, injections?: IInjection[]) => {
  let stubbedService;

  // TODO: need to be able to use an extended service that uses services. :)
  if (hash instanceof Function) {
    stubbedService = hash;
  } else {
    stubbedService = Service.extend(hash);
  }

  let { owner } = getContext();
  let serviceName = `service:${name}`;

  owner.register(serviceName, stubbedService);

  if (injections) {
    injections.forEach(injection => {
      owner.application.inject(injection.in, injection.as, serviceName);
    });
  }
};

export default stubService;
