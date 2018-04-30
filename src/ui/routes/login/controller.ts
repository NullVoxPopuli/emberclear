import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { generateNewKeys } from 'emberclear/src/utils/nacl';

export default class Login extends Controller.extend({
  keyGeneration: service('key-generation'),
  seed: '',

  actions: {
    generateSeed() {
      const { publicKey, privateKey } = generateNewKeys();
      // const seed = this.get('keyGeneration').newKeyPair();

      this.set('seed', privateKey);

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
