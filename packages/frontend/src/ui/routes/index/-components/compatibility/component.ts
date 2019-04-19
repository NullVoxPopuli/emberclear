import Ember from 'ember';
import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import {
  hasWASM,
  hasCamera,
  hasIndexedDb,
  hasNotifications,
  hasServiceWorker,
  hasWebWorker,
} from './-utils/detection';

export default class Compatibility extends Component {
  @tracked hasCamera!: boolean;
  @tracked hasIndexedDb!: boolean;
  @tracked hasWASM!: boolean;
  @tracked hasNotifications!: boolean;
  @tracked hasServiceWorker!: boolean;
  @tracked hasWebWorker!: boolean;

  @tracked successCount = 0;
  @tracked totalCount = 0;

  get isNotCompatible() {
    return this.totalCount !== this.successCount;
  }

  didInsertElement() {
    this.detectFeatures.perform();
  }

  @(task(function*() {
    let check = this.checkSuccess.bind(this);
    if (!Ember.testing) {
      this.hasIndexedDb = check(yield hasIndexedDb());
      this.hasWASM = check(hasWASM());
      this.hasCamera = check(hasCamera());
      this.hasWebWorker = check(hasWebWorker());
      this.hasServiceWorker = check(hasServiceWorker());
    }

    this.hasNotifications = check(hasNotifications());
  }).drop())
  detectFeatures;

  private checkSuccess(value: boolean) {
    if (value) {
      this.successCount++;
    }

    this.totalCount++;

    return value;
  }
}
