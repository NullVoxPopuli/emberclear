import Model from 'ember-data/model';
import { attr } from '@ember-decorators/data';

// TODO: https://github.com/localForage/localForage
// TODO: custom adapter for storage: https://guides.emberjs.com/v3.1.0/models/customizing-adapters/
// TODO: example implementation: https://github.com/mydea/ember-indexeddb/blob/master/addon/adapters/indexed-db.js
export default class Identity extends Model {
  @attr name?: string;
  @attr publicKey?: Uint8Array;
  @attr privateKey?: Uint8Array;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'identity': Identity;
  }
}
