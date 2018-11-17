import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter.extend({
  // do not change the namespace, as it would log everyone out
  // need a migration path if the namespace is going to change
  // namespace: 'emberclear',
  caching: 'none',

  shouldBackgroundReloadRecord() {
    return true;
  },

  shouldBackgroundReloadAll() {
    return true;
  },

  // ember-localforage does not throw valuable errors
  queryRecord(/* store, type, query */) {
    return new Promise((resolve, reject) => {
      return this._super(...arguments)
        .then(resolve)
        .catch(() => reject('no record found in localforage'));
    });
  },

  // async findRecord(store, type, id) {
  //   try {
  //     return await this._super(...arguments);
  //   } catch (error) {
  //     // ember-localforage does not throw valuable errors
  //     throw new EmberError(error || `record (${type}:${id}) not found in localforage`);
  //   }
  // },
});
