// import LFAdapter from 'ember-localforage-adapter/adapters/localforage';

// export default LFAdapter.extend({
//   // do not change the namespace, as it would log everyone out
//   // need a migration path if the namespace is going to change
//   // namespace: 'emberclear',
//   caching: 'none',

//   shouldBackgroundReloadRecord() {
//     return true;
//   },

//   shouldBackgroundReloadAll() {
//     return true;
//   },
// });

import { reject, resolve } from 'rsvp';
import Evented from '@ember/object/evented';
import DS from 'ember-data';
import LFQueue from 'ember-localforage-adapter/utils/queue';
import LFCache from 'ember-localforage-adapter/utils/cache';
import { v4 as uuid } from "ember-uuid";

export default DS.Adapter.extend(Evented, {
  custom: true,
  defaultSerializer: 'localforage',
  queue: LFQueue.create(),
  cache: LFCache.create(),
  caching: 'none',
  coalesceFindRequests: true,

  shouldBackgroundReloadRecord() {
    return false;
  },

  shouldReloadAll() {
    return true;
  },

  /**
   * This is the main entry point into finding records. The first parameter to
   * this method is the model's name as a string.
   *
   * @method findRecord
   * @param store
   * @param {DS.Model} type
   * @param {Object|String|Integer|null} id
   */
  findRecord(store, type, id) {
    return this._getNamespaceData(type).then((namespaceData) => {
      const record = namespaceData.records[id];

      if (!record) {
        return reject();
      }

      return record;
    });
  },

  findAll(store, type) {
    return this._getNamespaceData(type).then((namespaceData) => {
      const records = [];

      for (let id in namespaceData.records) {
        records.push(namespaceData.records[id]);
      }

      return { data: records.map(record => record.data) };
    });
  },

  findMany(store, type, ids) {
    return this._getNamespaceData(type).then((namespaceData) => {
      const records = [];

      for (let i = 0; i < ids.length; i++) {
        const record = namespaceData.records[ids[i]];

        if (record) {
          records.push(record);
        }
      }

      return records;
    });
  },

  queryRecord(store, type, query) {
    return this._getNamespaceData(type).then((namespaceData) => {
      const record = this._query(namespaceData.records, query, true);

      if (!record) {
        return reject();
      }

      return record;
    });
  },

  /**
   *  Supports queries that look like this:
   *   {
   *     <property to query>: <value or regex (for strings) to match>,
   *     ...
   *   }
   *
   * Every property added to the query is an "AND" query, not "OR"
   *
   * Example:
   * match records with "complete: true" and the name "foo" or "bar"
   *  { complete: true, name: /foo|bar/ }
   */
  query(store, type, query) {
    return this._getNamespaceData(type).then((namespaceData) => {
      let records = this._query(namespaceData.records, query);
      let result = { data: records.map(record => record.data) };

      return result;
    });
  },

  _query(records, query, singleMatch) {
    const results = singleMatch ? null : [];

    for (let id in records) {
      const record = records[id];
      const attributes = record.data.attributes;
      let isMatching = false;

      for (let property in query) {
        const queryValue = query[property];

        if (queryValue instanceof RegExp) {
          isMatching = queryValue.test(attributes[property]);
        } else {
          isMatching = attributes[property] === queryValue;
        }

        if (!isMatching) {
          break; // all criteria should pass
        }
      }

      if (isMatching) {
        if (singleMatch) {
          return record;
        }

        results.push(record);
      }
    }

    return results;
  },

  createRecord: updateOrCreate,

  updateRecord: updateOrCreate,

  deleteRecord(store, type, snapshot) {
    return this.queue.attach((resolve) => {
      this._getNamespaceData(type).then((namespaceData) => {
        delete namespaceData.records[snapshot.id];

        this._setNamespaceData(type, namespaceData).then(() => {
          resolve();
        });
      });
    });
  },

  generateIdForRecord() {
    return uuid();
  },

  // private

  _setNamespaceData(type, namespaceData) {
    const modelNamespace = this._modelNamespace(type);

    return this._loadData().then((storage) => {
      if (this.caching !== 'none') {
        this.cache.set(modelNamespace, namespaceData);
      }

      storage[modelNamespace] = namespaceData;

      return window.localforage.setItem(this._adapterNamespace(), storage);
    });
  },

  _getNamespaceData(type) {
    const modelNamespace = this._modelNamespace(type);

    if (this.caching !== 'none') {
      const cache = this.cache.get(modelNamespace);

      if (cache) {
        return resolve(cache);
      }
    }

    return this._loadData().then((storage) => {
      const namespaceData = storage && storage[modelNamespace] || { records: {} };

      if (this.caching === 'model') {
        this.cache.set(modelNamespace, namespaceData);
      } else if (this.caching === 'all') {
        if (storage) {
          this.cache.replace(storage);
        }
      }

      return namespaceData;
    });
  },

  _loadData() {
    return window.localforage.getItem(this._adapterNamespace()).then((storage) => {
      return storage ? storage : {};
    });
  },

  _modelNamespace(type) {
    return type.url || type.modelName;
  },

  _adapterNamespace() {
    return this.get('namespace') || 'DS.LFAdapter';
  }
});

function updateOrCreate(store, type, snapshot) {
  return this.queue.attach((resolve) => {
    this._getNamespaceData(type).then((namespaceData) => {
      const serializer = store.serializerFor(type.modelName);
      const recordHash = serializer.serialize(snapshot, {includeId: true});
      // update(id comes from snapshot) or create(id comes from serialization)
      const id = snapshot.id || recordHash.id;

      namespaceData.records[id] = recordHash;

      this._setNamespaceData(type, namespaceData).then(() => {
        resolve();
      });
    });
  });
}
