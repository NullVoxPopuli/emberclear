import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type ConnectionStatusService from '@emberclear/networking/services/connection/status';

export default class ConnectionStatus extends Component {
  @service('connection/status') declare status: ConnectionStatusService;
}
