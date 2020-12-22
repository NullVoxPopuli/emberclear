import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { currentUserId } from '@emberclear/local-account';

import type StoreService from '@ember-data/store';
import type ChatScroller from 'emberclear/services/chat-scroller';
import type { CurrentUserService } from '@emberclear/local-account';

interface IModelParams {
  id: string;
}

export default class ChatPrivatelyRoute extends Route {
  @service declare currentUser: CurrentUserService;
  @service declare chatScroller: ChatScroller;
  @service declare toast: Toast;
  @service declare intl: Intl;
  @service declare store: StoreService;

  async beforeModel(transition: any) {
    let params = transition.to.params;
    let { id } = params as IModelParams;

    if (id === this.currentUser.uid) {
      await this.transitionTo('chat.privately-with', currentUserId);
    }

    // Tells the view to scroll to the bottom.
    // TODO: is there a way to do this with just CSS?
    this.chatScroller.isLastVisible = true;
  }

  async model(params: IModelParams) {
    const { id } = params;

    let record;

    try {
      if (id === currentUserId) {
        record = this.currentUser.record;
      } else {
        record = await this.store.findRecord('contact', id);
      }
    } catch (error) {
      this.toast.error(error || this.intl.t('ui.chat.errors.contactNotFound'));

      await this.transitionTo('chat.index');
    }

    return {
      targetIdentity: record,
    };
  }
}
