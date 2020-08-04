import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import Sidebar from 'emberclear/services/sidebar';

export default class OffCanvasContainer extends Component {
  @service currentUser!: CurrentUserService;
  @service sidebar!: Sidebar;
}
