import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  keyForAttribute(key: string) {
    return key;
  },

  keyForRelationship(key: string) {
    return key;
  },
});
