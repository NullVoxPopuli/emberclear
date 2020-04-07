import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import CurrentUserService, { currentUserId } from 'emberclear/services/current-user';

interface IModelParams {
  user_id: string;
}

export default class VerifyFriendRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service toast!: Toast;
  @service intl!: Intl;
  @service store!: StoreService;

  beforeModel(transition: any) {
    let params = transition.to.params;
    let { user_id } = params as IModelParams;

    if (user_id === this.currentUser.uid || user_id === currentUserId) {
      this.transitionTo('contacts');
      this.toast.error(this.intl.t('ui.verifyContact.verifyYourselfWarning'));
    }
  }

  async model(params: IModelParams) {
    const { user_id } = params;

    let record;

    try {
      if (user_id === currentUserId) {
        record = this.currentUser.record;
      } else {
        record = await this.store.findRecord('contact', user_id);
      }
      this.transitionTo('contacts.verify-friend', user_id);
    } catch (error) {
      this.toast.error(error || this.intl.t('ui.chat.errors.contactNotFound'));

      this.transitionTo('contacts');
    }

    return {
      targetIdentity: record,
    };
  }
}
