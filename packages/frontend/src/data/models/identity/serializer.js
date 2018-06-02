import DS from 'ember-data';

export default DS.JSONSerializer.extend({

  _shouldSerializeHasMany(snapshot, key, relationship) {
    const relationshipType = snapshot.type.determineRelationshipType(relationship, this.store);

    if (this._mustSerialize(key)) {
      return true;
    }

    return this._canSerialize(key) &&
      (relationshipType === 'manyToNone' ||
        relationshipType === 'manyToMany' ||
        relationshipType === 'manyToOne');
  }
});
