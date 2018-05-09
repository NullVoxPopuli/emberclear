import DS from 'ember-data';

// TODO: https://github.com/localForage/localForage
// TODO: custom adapter for storage: https://guides.emberjs.com/v3.1.0/models/customizing-adapters/
// TODO: example implementation: https://github.com/mydea/ember-indexeddb/blob/master/addon/adapters/indexed-db.js
export default class Identity extends DS.Model.extend({
  name: DS.attr('string'),
  publicKey: DS.attr('string'),
  privateKey: DS.attr('string'),
}) {
  // normal class body definition here
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    'identity': Identity;
  }
}
