import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

import type { IQueryParams } from 'emberclear/controllers/invite';
import type ChannelManager from 'emberclear/services/channel-manager';
import type ContactManager from 'emberclear/services/contact-manager';
import type CurrentUserService from 'emberclear/services/current-user';
import type RedirectManager from 'emberclear/services/redirect-manager';

export default class InviteRoute extends Route {
  @service declare toast: Toast;
  @service declare currentUser: CurrentUserService;
  @service declare contactManager: ContactManager;
  @service declare channelManager: ChannelManager;
  @service declare redirectManager: RedirectManager;

  async beforeModel(transition: any) {
    transition.abort();

    // identity should be loaded from application route
    if (this.currentUser.isLoggedIn) {
      await this.acceptInvite(transition);

      return;
    }

    this.toast.info('Please login or create your account before the invite can be accepted');

    this.redirectManager.persistURL(transition.intent.url);

    // no identity, need to create one
    await this.transitionTo('setup');
  }

  async acceptInvite(transition: any) {
    const query = transition.to.queryParams as IQueryParams;

    if (this.hasParams(query)) {
      const { name, publicKey } = query;

      // if (isPresent(publicKey)) {
      return await this.acceptContactInvite(name!, publicKey!);
      // }
    }

    this.toast.error('Invalid Invite Link');

    return this.transitionTo('chat');
  }

  private async acceptContactInvite(name: string, publicKey: string) {
    if (publicKey === this.currentUser.record!.publicKeyAsHex) {
      this.toast.warning(`You can't invite yourself... but you can talk to yourself!`);

      return this.transitionTo('/chat/privately-with/me');
    }

    try {
      await this.contactManager.findOrCreate(publicKey!, name!);
    } catch (e) {
      this.toast.error(`There was a problem importing ${name}: ${e.message}`);

      return this.transitionTo('chat');
    }

    this.toast.success(`${name} has been successfully imported!`);

    await this.transitionTo(`/chat/privately-with/${publicKey}`);
  }

  private hasParams({ name, publicKey }: IQueryParams) {
    // TODO: support additional / different params for private channels
    return isPresent(name) && isPresent(publicKey);
  }
}
