import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { inLocalStorage } from 'ember-tracked-local-storage';

import type RouterService from '@ember/routing/router-service';

export default class RedirectManager extends Service {
  @service declare router: RouterService;

  @inLocalStorage attemptedRoute?: string;

  get hasPendingRedirect() {
    return Boolean(this.attemptedRoute);
  }

  persistURL(path: string) {
    this.attemptedRoute = path;
  }

  async evaluate() {
    if (this.hasPendingRedirect) {
      let next = this.attemptedRoute;

      this.attemptedRoute = undefined;

      if (next) {
        await this.router.transitionTo(next);
      }

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
