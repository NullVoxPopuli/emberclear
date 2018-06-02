import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { alias, notEmpty, equal, not } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class TopNav extends Component {
  @service identity!: IdentityService;
  // TODO: router type?
  @service router: any;

  @alias('router.currentRouteName') routeName!: string;
  @equal('routeName', 'index') isApplication!: boolean;
  @not('isApplication') isChat!: boolean;

  @alias('identity.record.name') name?: string;
  @notEmpty('identity.record.name') hasName!: boolean;

  @computed('isChat')
  get textColor() {
    if (this.isChat) return 'has-text-white';

    return '';
  }

  isTouchMenuVisible = false;

  @computed('isTouchMenuVisible')
  get touchMenuClasses() {
    if (this.isTouchMenuVisible) {
      return 'is-active';
    }

    return '';
  }

  @action
  toggleTouchMenu() {
    this.set('isTouchMenuVisible', !this.isTouchMenuVisible);
  }
}
