import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type WindowService from 'emberclear/services/window';

export default class Install extends Component {
  @service window!: WindowService;

  @action
  install() {
    return this.window.promptInstall();
  }
}
