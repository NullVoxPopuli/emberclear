import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

import { IQueryParams } from './controller';
import ContactManager from 'emberclear/services/contact-manager';
import ChannelManager from 'emberclear/services/channel-manager';
import RedirectManager from 'emberclear/services/redirect-manager/service';
import IdentityService from 'emberclear/services/identity/service';

export default class InviteRoute extends Route {
  @service toast!: Toast;
  @service identity!: IdentityService;
  @service contactManager!: ContactManager;
  @service channelManager!: ChannelManager;
  @service redirectManager!: RedirectManager;

  async beforeModel(transition: any) {
    // identity should be loaded from application route
    if (this.identity.isLoggedIn) return await this.acceptInvite(transition);

    this.toast.info('Please login or create your account before the invite can be accepted');

    this.redirectManager.persistURL(transition.intent.url);

    // no identity, need to create one
    this.transitionTo('setup');
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
    if (publicKey === this.identity.record!.publicKeyAsHex) {
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
    return this.transitionTo(`/chat/privately-with/${publicKey}`);
  }

  private hasParams({ name, publicKey }: IQueryParams) {
    // TODO: support additional / different params for private channels
    return isPresent(name) && isPresent(publicKey);
  }
}
