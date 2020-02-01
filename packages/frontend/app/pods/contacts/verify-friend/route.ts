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
    console.log('user_id: ', user_id);
    console.log('this.currentUser.uid: ', this.currentUser.uid);
    console.log('current_user_id: ', currentUserId);
    if (user_id === this.currentUser.uid) {
      this.transitionTo('contacts');
    }
  }

  async model(params: IModelParams) {
    const { user_id } = params;

    let record;

    try {
      console.log('user_id: ', user_id);
      console.log('current_user_id: ', currentUserId);
      if (user_id === currentUserId) {
        record = this.currentUser.record;
      } else {
        record = await this.store.findRecord('contact', user_id);
      }
    } catch (error) {
      this.toast.error(error || this.intl.t('ui.chat.errors.contactNotFound'));

      this.transitionTo('contacts');
    }
    this.transitionTo('contacts.verify-friend',user_id)
    return {
      targetIdentity: record,
    };
  }
}