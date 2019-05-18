import Ember from 'ember';
import Component from '@glimmer/component';
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
import Task from 'ember-concurrency/task';

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

  constructor(owner: any, args: any) {
    super(owner, args);
    this.detectFeatures.perform();
  }

  @(task(function*(this: Compatibility) {
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
  detectFeatures!: Task;

  private checkSuccess(value: boolean) {
    if (value) {
      this.successCount++;
    }

    this.totalCount++;

    return value;
  }
}
