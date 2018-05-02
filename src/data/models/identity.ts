import DS from 'ember-data';

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
