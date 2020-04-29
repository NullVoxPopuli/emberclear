import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';

import {
  STATUS,
  STATUS_UNKNOWN,
  STATUS_DEGRADED,
  STATUS_CONNECTED,
  STATUS_DISCONNECTED,
  STATUS_CONNECTING,
} from 'emberclear/utils/connection/connection-pool';
import { taskFor } from 'emberclear/utils/ember-concurrency';

const STATUS_LEVEL_MAP = {
  [STATUS_UNKNOWN]: 'warning',
  [STATUS_DEGRADED]: 'warning',
  [STATUS_CONNECTED]: 'info',
  [STATUS_CONNECTING]: 'info',
  [STATUS_DISCONNECTED]: 'danger',
};

export default class ConnectionStatusService extends Service {
  @tracked hasUpdate = false;
  @tracked hadUpdate = false;

  @tracked text = '';
  @tracked level = '';

  get isConnected() {
    switch (this.text) {
      case STATUS_CONNECTED:
      case STATUS_DEGRADED:
        return true;
      default:
        return false;
    }
  }

  updateStatus(text: STATUS) {
    this.text = text;
    this.level = STATUS_LEVEL_MAP[text];

    taskFor(this.showStatusChange).perform();
  }

  @restartableTask({ withTestWaiter: true })
  *showStatusChange() {
    this.hasUpdate = true;
    this.hadUpdate = false;

    yield timeout(2000);
    this.hadUpdate = true;

    yield timeout(1000);

    this.hasUpdate = false;
  }
}

declare module '@ember/service' {
  interface Registry {
    'connection/status': ConnectionStatusService;
  }
}
