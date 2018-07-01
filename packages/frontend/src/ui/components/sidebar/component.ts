import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';

import Sidebar from 'emberclear/services/sidebar';

export default class extends Component {
  @service sidebar!: Sidebar;

  @reads('sidebar.isShown') isShown!: boolean;
}
