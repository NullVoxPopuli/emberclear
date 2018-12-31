import Model from 'ember-data/model';
import { attr } from '@ember-decorators/data';

export default class Relay extends Model {
  @attr('string') socket!: string;
  @attr('string') og!: string;
  @attr('string') host!: string;

  @attr priority!: number;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data' {
  interface ModelRegistry {
    relay: Relay;
  }
}
