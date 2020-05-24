// TODO: transfer to CrowdStrike
import Service from '@ember/service';

export default class NavigatorService extends Service {
  get mediaDevices() {
    return navigator.mediaDevices;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'browser/navigator': NavigatorService;
  }
}
