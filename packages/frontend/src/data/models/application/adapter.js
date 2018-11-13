import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

export default LFAdapter.extend({
  namespace: 'emberclear',
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

  // ember-localforage does not throw valuable errors
  findRecord(store, type, id) {
    return new Promise((resolve, reject) => {
      return this._super(...arguments)
        .then(resolve)
        .catch(() => reject(`record (${type}:${id}) not found in localforage`));
    });
  },
});
