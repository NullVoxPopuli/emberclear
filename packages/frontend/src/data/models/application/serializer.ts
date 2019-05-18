import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  keyForAttribute(key: string) {
    return key;
  },
});
