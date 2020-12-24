import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import { STATUS_DISCONNECTED } from '@emberclear/networking/utils/connection/connection-pool';

import type { ConnectionStatus as StatusService } from '@emberclear/networking';

export default class ConnectionStatus extends Component {
  DISCONNECTED = STATUS_DISCONNECTED;

  @service('connection/status') declare status: StatusService;
}
