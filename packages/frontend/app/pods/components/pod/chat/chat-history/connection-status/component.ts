import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ConnectionStatusService from 'emberclear/services/connection/status';

export default class ConnectionStatus extends Component {
  @service('connection/status') status!: ConnectionStatusService;
}
