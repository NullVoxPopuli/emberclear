import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import CurrentUserService, { currentUserId } from 'emberclear/services/current-user';

interface IModelParams {
  u_id: string;
}

export default class VerifyFriendRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service toast!: Toast;
  @service intl!: Intl;
  @service store!: StoreService;

  beforeModel(transition: any) {
    let params = transition.to.params;
    let { u_id } = params as IModelParams;

    if (u_id === this.currentUser.uid) {
      this.transitionTo('contacts');
    }
  }

  async model(params: IModelParams) {
    const { u_id } = params;

    let record;

    try {
      if (u_id === currentUserId) {
        record = this.currentUser.record;
      } else {
        record = await this.store.findRecord('contact', u_id);
      }
    } catch (error) {
      this.toast.error(error || this.intl.t('ui.chat.errors.contactNotFound'));

      this.transitionTo('contacts');
    }

    return {
      targetIdentity: record,
    };
  }
}