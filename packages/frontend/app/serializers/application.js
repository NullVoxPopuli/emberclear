const myFancyInflector = {
  messages: 'message',
  channels: 'channel',
  contacts: 'contact',
  identities: 'identity',
  'invitation-results': 'invitations-result',
  invitations: 'invitation',
  'message-medias': 'message-media',
  relays: 'relay',
  users: 'user',
};

function enforceSingularTypesInDocument(document) {
  if (Array.isArray(document.data)) {
    document.data.map(singularizeResource);
  } else if (document.data) {
    singularizeResource(document.data);
  }

  if (Array.isArray(document.included)) {
    document.included.map(singularizeResource);
  }

  return document;
}

function singularizeResource(resource) {
  resource.type = singularize(resource.type);
  if (resource.relationships) {
    Object.keys(resource.relationships).forEach((key) => {
      let data = resource.relationships[key].data;

      if (Array.isArray(data)) {
        data.forEach((r) => {
          r.type = singularize(r.type);
        });
      } else if (data) {
        data.type = singularize(data.type);
      }
    });
  }
}

function singularize(str) {
  return myFancyInflector[str] || str;
}

export default class ApplicationSerializer {
  static create() {
    return new ApplicationSerializer();
  }

  normalizeResponse(_store, _schema, jsonApiDocument) {
    let normalized = enforceSingularTypesInDocument(jsonApiDocument);

    return normalized;
  }

  serialize(snapshot /*, options */) {
    let type = snapshot.modelName;
    let id = snapshot.id;

    let attributes = snapshot.attributes();
    let relationships = {};

    snapshot.eachRelationship((key, meta) => {
      let r = (relationships[key] = {});
      if (meta.kind === 'belongsTo') {
        let related = snapshot.belongsTo(key);

        if (!related) {
          r.data = null;
        } else {
          if (!related.id) {
            throw new Error(`Attempting to save a relationship that has no id`);
          }

          r.data = { type: related.modelName, id: related.id };
        }
      } else {
        let relatedSnapshots = snapshot.hasMany(key);
        r.data = [];

        if (!relatedSnapshots) {
          return;
        }

        relatedSnapshots.map((related) => {
          if (!related.id) {
            throw new Error(`Attempting to save a relationship that has no id`);
          }

          r.data.push({ type: related.modelName, id: related.id });
        });
      }
    });

    return {
      data: {
        type,
        id,
        attributes,
        relationships,
      },
    };
  }
}
