import { default as Store } from '@ember-data/store';
import { RecordData } from '@ember-data/record-data/-private';
import { identifierCacheFor } from '@ember-data/store/-private';

export default class StoreService extends Store {
  createRecordDataFor(modelName, id, clientId, storeWrapper) {
    let identifier = identifierCacheFor(this).getOrCreateRecordIdentifier({
      type: modelName,
      id,
      lid: clientId,
    });
    return new RecordData(identifier, storeWrapper);
  }
}
