import Component from '@glimmer/component';

import { inject as service } from '@ember/service';

import type CurrentUserService from 'emberclear/services/current-user';

export default class UserDropMenu extends Component {
  @service currentUser!: CurrentUserService;
}
