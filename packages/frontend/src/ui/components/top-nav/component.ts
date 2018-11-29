import Component from '@ember/component';
import { Registry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { alias, equal } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';
import Sidebar from 'emberclear/services/sidebar/service';

export default class TopNav extends Component {
  @service identity!: IdentityService;
  @service router!: Registry['router'];
  @service sidebar!: Sidebar;

  @alias('router.currentRouteName') routeName!: string;
  @alias('identity.isLoggedIn') isLoggedIn!: boolean;
  @equal('routeName', 'index') isApplication!: boolean;

  @computed('isApplication')
  get isChat(): boolean {
    return !this.isApplication;
  }

  @computed('isChat')
  get textColor(this: TopNav) {
    if (this.isChat) return 'has-text-white';

    return '';
  }

  @action
  toggleSidebar(this: TopNav) {
    this.sidebar.toggle();
  }
}
