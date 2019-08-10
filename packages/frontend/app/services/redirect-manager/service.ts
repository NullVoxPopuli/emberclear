import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { inLocalStorage } from 'emberclear/src/utils/decorators';
import RouterService from '@ember/routing/router-service';

export default class RedirectManager extends Service {
  @service router!: RouterService;

  @inLocalStorage attemptedRoute?: string;

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
