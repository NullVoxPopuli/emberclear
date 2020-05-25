import Ember from 'ember';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import {
  hasCamera,
  hasIndexedDb,
  hasNotifications,
  hasServiceWorker,
  hasWebWorker,
} from './-utils/detection';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'emberclear/utils/ember-concurrency';

export default class Compatibility extends Component {
  @tracked hasCamera!: boolean;
  @tracked hasIndexedDb!: boolean;
  // @tracked hasWASM!: boolean;
  @tracked hasNotifications!: boolean;
  @tracked hasServiceWorker!: boolean;
  @tracked hasWebWorker!: boolean;

  @tracked successCount = 0;
  @tracked totalCount = 0;
  @tracked requiredSuccessCount = 0;
  @tracked totalRequiredCount = 0;

  get isNotCompatible() {
    return this.totalRequiredCount !== this.requiredSuccessCount;
  }

  constructor(owner: any, args: any) {
    super(owner, args);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.detectFeatures).perform();
  }

  @dropTask
  *detectFeatures() {
    let check = this.checkSuccess.bind(this);

    this.hasIndexedDb = check(yield hasIndexedDb(), { required: true });

    if (!Ember.testing) {
      this.hasCamera = check(hasCamera());
      this.hasWebWorker = check(hasWebWorker());
      this.hasServiceWorker = check(hasServiceWorker());
    }

    this.hasNotifications = check(hasNotifications());
  }

  private checkSuccess(value: boolean, { required = false }: { required?: boolean } = {}) {
    if (required) {
      this.totalRequiredCount++;
    }

    if (value) {
      this.successCount++;

      if (required) {
        this.requiredSuccessCount++;
      }
    }

    this.totalCount++;

    return value;
  }
}
