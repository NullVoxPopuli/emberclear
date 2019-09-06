import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

export default class ConnectionStatusService extends Service {
  @tracked hasUpdate = false;
  @tracked hadUpdate = false;

  @tracked text;
  @tracked level;

  updateStatus(text, level) {
    this.text = text;
    this.level = level;

    this.showStatusChange.perform();
  }

  @(task(function*(){
    this.hasUpdate = true;
    this.hadUpdate = false;

    yield timeout(2000);
    this.hadUpdate = true;

    yield timeout(1000);

    this.hasUpdate = false;
  }).restartable())
  showStatusChange;


}
