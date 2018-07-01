import Component from '@ember/component';
import { Registry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { alias, equal } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class TopNav extends Component {
  @service identity!: IdentityService;
  @service router!: Registry['router'];
  @service fastboot!: FastBoot;

  isTouchMenuVisible = false;

  @alias('router.currentRouteName') routeName!: string;
  @alias('identity.isLoggedIn') isLoggedIn!: boolean;
  @equal('routeName', 'index') isApplication!: boolean;

  @computed('isApplication')
  get isChat(): boolean {
    if (this.fastboot.isFastBoot) {
      const path = this.fastboot.request.path;
      return !(path === '' || path === '/');
    }

    return !this.isApplication;
  }

  @computed('isChat')
  get textColor(this: TopNav) {
    if (this.isChat) return 'has-text-white';

    return '';
  }

  @action
  toggleTouchMenu(this: TopNav) {
    this.set('isTouchMenuVisible', !this.isTouchMenuVisible);
  }

}
