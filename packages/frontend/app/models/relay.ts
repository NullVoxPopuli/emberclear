import { tracked } from '@glimmer/tracking';
import Model, { attr } from '@ember-data/model';

export default class Relay extends Model {
  @attr('string') socket!: string;
  @attr('string') og!: string;
  @attr('string') host!: string;

  @attr() priority!: number;

  @tracked connectionCount = 0;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
  interface ModelRegistry {
    relay: Relay;
  }
}
