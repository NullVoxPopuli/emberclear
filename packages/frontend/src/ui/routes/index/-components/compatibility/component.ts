import Component, { tracked } from 'sparkles-component';
import { dropTask } from 'ember-concurrency-decorators';

import { hasWASM, hasCamera, hasIndexedDb } from './-utils/detection';

export default class Compatibility extends Component {
  @tracked hasCamera!: boolean;
  @tracked hasIndexedDb!: boolean;
  @tracked hasWASM!: boolean;
  @tracked hasNotifications!: boolean;
  @tracked hasServiceWorker!: boolean;
  @tracked hasWebWorker!: boolean;

  @tracked successCount = 0;
  @tracked totalCount = 0;

  @tracked('successCount', 'totalCount')
  get isNotCompatible() {
    return this.totalCount !== this.successCount;
  }

  didInsertElement() {
    this.detectFeatures.perform();
  }

  @dropTask
  *detectFeatures(this: Compatibility) {
    let check = this.checkSuccess.bind(this);

    this.hasIndexedDb = check(yield hasIndexedDb());
    this.hasCamera = check(hasCamera());
    this.hasWASM = check(hasWASM());
    this.hasNotifications = check('Notification' in window);
    this.hasServiceWorker = check('ServiceWorker' in window);
    this.hasWebWorker = check('Worker' in window);
  }

  private checkSuccess(value: boolean) {
    if (value) {
      this.successCount++;
    }

    this.totalCount++;

    return value;
  }
}
