import Component from '@ember/component';
import { Registry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { alias, notEmpty, equal, not } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class TopNav extends Component {
  @service identity!: IdentityService;
  @service router!: Registry['router'];

  @alias('router.currentRouteName') routeName!: string;
  @equal('routeName', 'index') isApplication!: boolean;
  @not('isApplication') isChat!: boolean;

  @notEmpty('identity.name') hasName!: boolean;

  @computed('isChat')
  get textColor(this: TopNav) {
    if (this.isChat) return 'has-text-white';

    return '';
  }

  isTouchMenuVisible = false;

  @computed('isTouchMenuVisible')
  get touchMenuClasses(this: TopNav) {
    if (this.isTouchMenuVisible) {
      return 'is-active';
    }

    return '';
  }

  @action
  toggleTouchMenu(this: TopNav) {
    this.set('isTouchMenuVisible', !this.isTouchMenuVisible);
  }
}
