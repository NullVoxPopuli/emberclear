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
});
