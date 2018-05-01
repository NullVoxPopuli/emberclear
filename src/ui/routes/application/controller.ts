import Controller from '@ember/controller';

import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';

export default class Login extends Controller {
  @service('key-generation') keyGeneration;

  seed = ''

  @action
  generateSeed() {
    const seed = this.keyGeneration.newKeyPair();

    this.set('seed', seed);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'login': Login;
  }
}
