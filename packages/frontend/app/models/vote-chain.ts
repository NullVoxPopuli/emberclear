import Model, { attr, hasMany } from '@ember-data/model';

import Identity from 'emberclear/models/identity';

export default class VoteChain extends Model {
    @hasMany('identity', { async: false }) remaining!: Identity[];
    @hasMany('identity', { async: false }) yes!: Identity[];
    @hasMany('identity', { async: false}) no!: Identity[];
    @attr() previousVoteKey!: Identity;
    @attr() previousVoteChain!: VoteChain;//declare as encrypted
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'vote-chain': VoteChain;
    }
}