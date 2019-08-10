import Model from 'ember-data/model';
import DS from 'ember-data';
const { attr } = DS;

export default class Relay extends Model {
  @attr('string') socket!: string;
  @attr('string') og!: string;
  @attr('string') host!: string;

  @attr() priority!: number;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  interface ModelRegistry {
    relay: Relay;
  }
}
