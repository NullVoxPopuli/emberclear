import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

import { syncToLocalStorage } from 'emberclear/src/utils/decorators';

export default class RedirectManager extends Service {
  @service router;

  @syncToLocalStorage
  get attemptedRoute() {
    return null;
  }

  @computed('attemptedRoute')
  get hasPendingRedirect() {
    return !!this.attemptedRoute;
  }

  persistURL(path: string) {
    this.set('attemptedRoute', path);
  }

  evaluate() {
    if (this.hasPendingRedirect) {
      this.router.transitionTo(this.attemptedRoute!);
      this.set('attemptedRoute', null);

      return true;
    }

    return false;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'redirect-manager': RedirectManager;
  }
}
