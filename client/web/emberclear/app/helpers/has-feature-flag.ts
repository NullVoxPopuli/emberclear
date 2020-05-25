import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

import SessionService from 'emberclear/services/session';

export default class extends Helper {
  @service session!: SessionService;

  compute([flag]: string[]) {
    return this.session.hasFeatureFlag(flag);
  }
}
