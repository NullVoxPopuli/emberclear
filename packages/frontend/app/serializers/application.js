export default class ApplicationSerializer {
  static create() {
    return new this();
  }

  normalizeResponse(_store, _schema, payload) {
    return payload;
  }

  serialize(snapshot, _options) {
    let type = snapshot.modelName;
    let id = snapshot.id;

    let attributes = snapshot.attributes();
    let relationships = {};

    snapshot.eachRelationship((key, meta) => {
      let r = (relationships[key] = {});
      if (meta.kind === 'belongsTo') {
        let related = snapshot.belongsTo(key);

        if (!related.id) {
          throw new Error(`Attempting to save a relationship that has no id`);
        }

        r.data = { type: related.modelName, id: related.id };
      } else {
        let relatedSnapshots = snapshot.hasMany(key);

        r.data = [];
        relatedSnapshots.map(related => {
          if (!related.id) {
            throw new Error(`Attempting to save a relationship that has no id`);
          }

          r.data.push({ type: related.modelName, id: related.id });
        });
      }
    });

    return {
      type,
      id,
      attributes,
      relationships,
    };
  }
}
