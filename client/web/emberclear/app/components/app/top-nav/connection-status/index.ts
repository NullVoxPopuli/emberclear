import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ConnectionStatusService from 'emberclear/services/connection/status';
import { STATUS_DISCONNECTED } from 'emberclear/utils/connection/connection-pool';

export default class ConnectionStatus extends Component {
  DISCONNECTED = STATUS_DISCONNECTED;

  @service('connection/status') status!: ConnectionStatusService;
}
