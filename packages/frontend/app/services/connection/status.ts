import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import Task from 'ember-concurrency/task';

export default class ConnectionStatusService extends Service {
  @tracked hasUpdate = false;
  @tracked hadUpdate = false;

  @tracked text = '';
  @tracked level = '';

  updateStatus(text: string, level: string) {
    this.text = text;
    this.level = level;

    this.showStatusChange.perform();
  }

  @(task(function*(this: ConnectionStatusService) {
    this.hasUpdate = true;
    this.hadUpdate = false;

    yield timeout(2000);
    this.hadUpdate = true;

    yield timeout(1000);

    this.hasUpdate = false;
  }).restartable())
  showStatusChange!: Task;
}

declare module '@ember/service' {
  interface Registry {
    'connection/status': ConnectionStatusService;
  }
}
