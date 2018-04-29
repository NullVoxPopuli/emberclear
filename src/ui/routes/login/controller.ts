import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class Login extends Controller.extend({
  keyGeneration: service('key-generation'),
  seed: '',

  actions: {
    generateSeed() {
      const seed = this.get('keyGeneration').newKeyPair();

      this.set('seed', seed);

    }
  }
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'login': Login;
  }
}
