import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { inLocalStorage } from 'emberclear/utils/decorators';
import RouterService from '@ember/routing/router-service';

export default class RedirectManager extends Service {
  @service declare router: RouterService;

  @inLocalStorage attemptedRoute?: string;

  get hasPendingRedirect() {
    return !!this.attemptedRoute;
  }

  persistURL(path: string) {
    this.attemptedRoute = path;
  }

  async evaluate() {
    if (this.hasPendingRedirect) {
      await this.router.transitionTo(this.attemptedRoute!);
      this.attemptedRoute = undefined;

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
