import Service from '@ember/service';
import { Registry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';


import { syncToLocalStorage, disableInFastboot } from 'emberclear/src/utils/decorators';

export default class RedirectManager extends Service {
  @service router!: Registry['router'];

  @disableInFastboot
  @syncToLocalStorage
  get attemptedRoute() {
    return null;
  }

  @computed('attemptedRoute')
  get hasPendingRedirect() {
    return !!this.attemptedRoute;
  }

  persistURL() {
    const location = (this.router as any).location.location as Location;
    const url = `${location.pathname}${location.search}`;

    this.set('attemptedRoute', url);
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
