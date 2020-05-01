import StoreService from 'emberclear/services/store';
import Channel from 'emberclear/models/channel';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import Vote from 'emberclear/models/vote';
import VoteChain from 'emberclear/models/vote-chain';
import Service, { inject as service } from '@ember/service';
import ContactManager from '../contact-manager';
import Identity from 'emberclear/models/identity';
import CurrentUserService from '../current-user';

export default class FindOrCreateChannelModelService extends Service {
  @service store!: StoreService;
  @service contactManager!: ContactManager;
  @service currentUser!: CurrentUserService;

  async findOrCreateChannel(channelInfo: StandardMessage['channelInfo']): Promise<Channel> {
    const { uid, name, members, admin, activeVotes, contextChain } = channelInfo!;

    try {
      return await this.store.findRecord('channel', uid);
    } catch (e) {
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
  }

  async findOrCreateContextChain(
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
      contextChain = await this.store.createRecord('channelContextChain', {
        id,
        admin: await this.findOrCreateMember(standardContextChain.admin),
        members: standardContextChain.members.map((member) => this.findOrCreateMember(member)),
        voteChain: await this.findOrCreateVote(standardContextChain.supportingVote),
        previousVoteChain: await this.findOrCreateContextChain(standardContextChain.previousChain),
      });
      return contextChain;
    }
  }

  async findOrCreateVote(standardVote: StandardVote): Promise<Vote | undefined> {
    if (standardVote === undefined) {
      return undefined;
    }

    const { id } = standardVote;

    let vote = undefined;

    try {
      vote = await this.store.findRecord('vote', id);
      return vote;
    } catch (e) {
      vote = this.store.createRecord('vote', {
        id,
        voteChain: await this.findOrCreateVoteChain(standardVote.voteChain),
      });
      return vote;
    }
  }

  async findOrCreateVoteChain(
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
  }

  async findOrCreateMember(senderData: ChannelMember): Promise<Identity> {
    const { name, id } = senderData;

    if (id === this.currentUser.uid) {
      return this.currentUser.record!;
    }

    return await this.contactManager.findOrCreate(id, name);
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/find-or-create': FindOrCreateChannelModelService;
  }
}
