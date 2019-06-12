import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import WindowService from 'emberclear/services/window';

export default class Install extends Component {
  @service window!: WindowService;

  get shouldRender() {
    return this.window.hasDeferredInstall && !this.window.isInstalled;
  }

  @action install() {
    this.window.promptInstall();
  }
}
