import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import WindowService from 'emberclear/services/window';

export default class Install extends Component {
  @service window!: WindowService;

  @action install() {
    this.window.promptInstall();
  }
}
