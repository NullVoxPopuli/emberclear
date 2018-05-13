import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { alias, notEmpty } from '@ember-decorators/object/computed';

import IdentityService from 'emberclear/services/identity/service';

export default class TopNav extends Component {
  @service identity!: IdentityService;

  @alias('identity.record.name') name?: string;
  @notEmpty('identity.record.name') hasName!: boolean;
}
