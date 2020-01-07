import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService, { currentUserId } from 'emberclear/services/current-user';
import ChatScroller from 'emberclear/services/chat-scroller';

interface IModelParams {
  u_id: string;
}

export default class ChatPrivatelyRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service chatScroller!: ChatScroller;
  @service toast!: Toast;
  @service intl!: Intl;
  @service store;

  beforeModel(transition: any) {
    let params = transition.to.params;
    let { u_id } = params as IModelParams;

    if (u_id === this.currentUser.uid) {
      this.transitionTo('chat.privately-with', currentUserId);
    }

    // Tells the view to scroll to the bottom.
    // TODO: is there a way to do this with just CSS?
    this.chatScroller.isLastVisible = true;
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

      this.transitionTo('chat.index');
    }

    return {
      targetIdentity: record,
    };
  }
}
