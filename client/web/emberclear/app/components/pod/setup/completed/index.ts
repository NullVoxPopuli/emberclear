import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import type { CurrentUserService } from '@emberclear/local-account';

export default class SetupCompleted extends Component {
  @service declare currentUser: CurrentUserService;
}
