import Service from '@ember/service';

import { inLocalStorage } from 'ember-tracked-local-storage';

export default class PlayerInfo extends Service {
  @inLocalStorage name = '';
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'player-info': PlayerInfo;
  }
}
