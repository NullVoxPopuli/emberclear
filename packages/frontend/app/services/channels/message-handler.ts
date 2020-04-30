import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import Notifications from 'emberclear/services/notifications';
import ChannelVerifier from './channel-verifier';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import Identity from 'emberclear/models/identity';
import VoteChain from 'emberclear/models/vote-chain';
import Vote from 'emberclear/models/vote';
import CurrentUserService from '../current-user';
import ContactManager from '../contact-manager';
import Channel from 'emberclear/models/channel';

export default class ReceivedChannelMessageHandler extends Service {
  @service store!: StoreService;
  @service intl!: Intl;
  @service notifications!: Notifications;
  @service('channels/channel-verifier') channelVerifier!: ChannelVerifier;
  @service currentUser!: CurrentUserService;
  @service contactManager!: ContactManager;

  public async handleChannelMessage(message: Message, raw: StandardMessage) {
    // check if channel exists
    let existingChannel = undefined;
    try {
      existingChannel = await this.store.findRecord('channel', raw.channelInfo!.uid);
    } catch (e) {
      // TODO: handle if user not in channel
    }
    // check if sender is in channel
    if (existingChannel?.members.contains(message.sender!)) {
      // save message in channel messages
      await message.save();
      const senderName = message.sender!.name;
      const channelName = existingChannel.name;
      // TODO: make new notification for channels messages
      const msg = this.intl.t('ui.notificatoin.from', { senderName });

      this.notifications.info(msg);

      // TODO: check to look for tampered or mismatched context and handle accordingly
      if (!this.channelVerifier.isValidChain(existingChannel.contextChain)) {
        // TODO: Do something to show/notify that the channel context is incorrect
        // TODO: The receiver notifies the sender with similar things
      }
    }
    return message;
  }

  private async buildNewReceivedChannel(json: StandardMessage): Promise<Channel> {
    const { uid, name, members, admin, activeVotes, contextChain } = json.channelInfo!;

    const channel = this.store.createRecord('channel', {
      uid,
      name,
      admin: await this.findOrCreateMember(admin),
      members: members.map(async (member) => await this.findOrCreateMember(member)),
      activeVotes: activeVotes.map(
        async (vote) => await this.findOrCreateVoteChain(vote.voteChain)
      ),
      contextChain: await this.findOrCreateContextChain(contextChain),
    });

    return channel;
  }

  private async findOrCreateContextChain(
    standardContextChain: StandardChannelContextChain
  ): Promise<ChannelContextChain | undefined> {
    if (standardContextChain === undefined) {
      return undefined;
    }

    const { id } = standardContextChain;

    let contextChain = undefined;

    try {
      contextChain = await this.store.findRecord('channelContextChain', id);
      return contextChain;
    } catch (e) {
      // TODO: say something
    }

    contextChain = await this.store.createRecord('channelContextChain', {
      id,
      admin: await this.findOrCreateMember(standardContextChain.admin),
      members: standardContextChain.members.map((member) => this.findOrCreateMember(member)),
      voteChain: await this.findOrCreateVote(standardContextChain.supportingVote),
      previousVoteChain: await this.findOrCreateContextChain(standardContextChain.previousChain),
    });
    return contextChain;
  }

  private async findOrCreateVote(standardVote: StandardVote): Promise<Vote | undefined> {
    if (standardVote === undefined) {
      return undefined;
    }

    const { id } = standardVote;

    let vote = undefined;

    try {
      vote = await this.store.findRecord('vote', id);
      return vote;
    } catch (e) {
      // TODO: say something
    }

    vote = this.store.createRecord('vote', {
      id,
      voteChain: await this.findOrCreateVoteChain(standardVote.voteChain),
    });
    return vote;
  }

  private async findOrCreateVoteChain(
    standardVoteChain: StandardVoteChain
  ): Promise<VoteChain | undefined> {
    if (standardVoteChain === undefined) {
      return undefined;
    }

    const { id } = standardVoteChain;

    let voteChain = undefined;

    try {
      voteChain = await this.store.findRecord('voteChain', id);
      return voteChain;
    } catch (e) {
      // TODO: say something
    }

    voteChain = this.store.createRecord('voteChain', {
      id,
      remaining: standardVoteChain.remaining.map(
        async (member) => await this.findOrCreateMember(member)
      ),
      yes: standardVoteChain.yes.map(async (member) => await this.findOrCreateMember(member)),
      no: standardVoteChain.no.map(async (member) => await this.findOrCreateMember(member)),
      target: await this.findOrCreateMember(standardVoteChain.target),
      action: standardVoteChain.action,
      key: await this.findOrCreateMember(standardVoteChain.previousVoteKey),
      previousVoteChain: await this.findOrCreateVoteChain(standardVoteChain.previousVoteChain),
    });
    return voteChain;
  }

  private async findOrCreateMember(senderData: ChannelMember): Promise<Identity> {
    const { name, id } = senderData;

    if (id === this.currentUser.uid) {
      return this.currentUser.record!;
    }

    return await this.contactManager.findOrCreate(id, name);
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/message-handler': ReceivedChannelMessageHandler;
  }
}
