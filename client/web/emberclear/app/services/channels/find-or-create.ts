import StoreService from 'emberclear/services/store';
import Channel from 'emberclear/models/channel';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import Vote from 'emberclear/models/vote';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import Service, { inject as service } from '@ember/service';
import ContactManager from '../contact-manager';
import Identity from 'emberclear/models/identity';
import CurrentUserService from '../current-user';
import { fromHex } from 'emberclear/utils/string-encoding';

export default class FindOrCreateChannelService extends Service {
  @service store!: StoreService;
  @service contactManager!: ContactManager;
  @service currentUser!: CurrentUserService;

  async findOrCreateChannel(channelInfo: StandardMessage['channelInfo']): Promise<Channel> {
    const { uid, name, activeVotes, contextChain } = channelInfo!;

    try {
      return await this.store.findRecord('channel', uid);
    } catch (e) {
      const channel = this.store.createRecord('channel', {
        uid,
        name,
        activeVotes: await Promise.all(
          activeVotes.map(async (vote) => await this.findOrCreateVote(vote))
        ),
        contextChain: await this.findOrCreateContextChain(contextChain),
      });

      return channel;
    }
  }

  async updateOrCreateChannel(channelInfo: StandardMessage['channelInfo']): Promise<Channel> {
    const { uid, name, activeVotes, contextChain } = channelInfo!;
    let channel: Channel;

    try {
      channel = await this.store.findRecord('channel', uid);
    } catch (e) {
      channel = this.store.createRecord('channel', uid);
    }

    channel.name = name;
    channel.activeVotes = await Promise.all(
      activeVotes.map(async (vote) => await this.updateOrCreateVote(vote))
    );
    channel.contextChain = (await this.updateOrCreateContextChain(contextChain))!;

    return channel;
  }

  async unloadChannel(channel: Channel): Promise<void> {
    channel.activeVotes.forEach(async (activeVote) => await this.unloadVote(activeVote));
    await this.unloadChannelContextChain(channel.contextChain);
    await this.store.unloadRecord(channel);
  }

  async findOrCreateContextChain(
    standardContextChain?: StandardChannelContextChain
  ): Promise<ChannelContextChain | undefined> {
    if (standardContextChain === undefined) {
      return undefined;
    }

    const { id } = standardContextChain;

    let contextChain = undefined;

    try {
      contextChain = await this.store.findRecord('channel-context-chain', id);

      return contextChain;
    } catch (e) {
      contextChain = await this.store.createRecord('channel-context-chain', {
        id,
        admin: await this.findOrCreateMember(standardContextChain.admin),
        members: Promise.all(
          standardContextChain.members.map((member) => this.findOrCreateMember(member))
        ),
        supportingVote: await this.findOrCreateVoteChain(standardContextChain.supportingVote),
        previousVoteChain: await this.findOrCreateContextChain(standardContextChain.previousChain),
      });

      return contextChain;
    }
  }

  async updateOrCreateContextChain(
    standardContextChain?: StandardChannelContextChain
  ): Promise<ChannelContextChain | undefined> {
    if (!standardContextChain) {
      return undefined;
    }

    const { id } = standardContextChain;
    let contextChain: ChannelContextChain;

    try {
      contextChain = await this.store.findRecord('channel-context-chain', id);
    } catch (e) {
      contextChain = this.store.createRecord('channel-context-chain', id);
    }

    contextChain.admin = await this.findOrCreateMember(standardContextChain.admin);
    contextChain.members = await Promise.all(
      standardContextChain.members.map(async (member) => await this.findOrCreateMember(member))
    );
    contextChain.supportingVote = await this.updateOrCreateVoteChain(
      standardContextChain.supportingVote
    );
    contextChain.previousChain = await this.updateOrCreateContextChain(
      standardContextChain.previousChain
    );

    return contextChain;
  }

  async unloadChannelContextChain(contextChain: ChannelContextChain): Promise<void> {
    if (!contextChain) {
      return;
    }

    await this.store.unloadRecord(contextChain.admin);
    contextChain.members.forEach(async (member) => await this.store.unloadRecord(member));
    await this.unloadVoteChain(contextChain.supportingVote!);
    await this.unloadChannelContextChain(contextChain.previousChain!);
    await this.store.unloadRecord(contextChain);
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

  async updateOrCreateVote(standardVote: StandardVote): Promise<Vote> {
    const { id } = standardVote;
    let vote: Vote;

    try {
      vote = await this.store.findRecord('vote', id);
    } catch (e) {
      vote = this.store.createRecord('vote', id);
    }

    vote.voteChain = (await this.updateOrCreateVoteChain(standardVote.voteChain))!;

    return vote;
  }

  async unloadVote(vote: Vote): Promise<void> {
    await this.unloadVoteChain(vote.voteChain);
    await this.store.unloadRecord(vote);
  }

  async findOrCreateVoteChain(
    standardVoteChain?: StandardVoteChain
  ): Promise<VoteChain | undefined> {
    if (!standardVoteChain) {
      return undefined;
    }

    const { id } = standardVoteChain;

    let voteChain = undefined;

    try {
      voteChain = await this.store.findRecord('vote-chain', id);

      return voteChain;
    } catch (e) {
      voteChain = this.store.createRecord('vote-chain', {
        id,
        remaining: Promise.all(
          standardVoteChain.remaining.map(async (member) => await this.findOrCreateMember(member))
        ),
        yes: Promise.all(
          standardVoteChain.yes.map(async (member) => await this.findOrCreateMember(member))
        ),
        no: Promise.all(
          standardVoteChain.no.map(async (member) => await this.findOrCreateMember(member))
        ),
        target: await this.findOrCreateMember(standardVoteChain.target),
        action: standardVoteChain.action,
        key: await this.findOrCreateMember(standardVoteChain.key),
        signature: fromHex(standardVoteChain.signature),
        previousVoteChain: await this.findOrCreateVoteChain(standardVoteChain.previousVoteChain),
      });

      return voteChain;
    }
  }

  async updateOrCreateVoteChain(
    standardVoteChain?: StandardVoteChain
  ): Promise<VoteChain | undefined> {
    if (!standardVoteChain) {
      return undefined;
    }

    const { id } = standardVoteChain;

    let voteChain: VoteChain;

    try {
      voteChain = await this.store.findRecord('vote-chain', id);
    } catch (e) {
      voteChain = await this.store.createRecord('vote-chain', id);
    }

    voteChain.remaining = await Promise.all(
      standardVoteChain.remaining.map(async (member) => await this.findOrCreateMember(member))
    );
    voteChain.yes = await Promise.all(
      standardVoteChain.yes.map(async (member) => await this.findOrCreateMember(member))
    );
    voteChain.no = await Promise.all(
      standardVoteChain.no.map(async (member) => await this.findOrCreateMember(member))
    );
    voteChain.target = await this.findOrCreateMember(standardVoteChain.target);
    voteChain.action = standardVoteChain.action as VOTE_ACTION;
    voteChain.key = await this.findOrCreateMember(standardVoteChain.key);
    voteChain.signature = fromHex(standardVoteChain.signature);
    voteChain.previousVoteChain = await this.updateOrCreateVoteChain(
      standardVoteChain.previousVoteChain
    );

    return voteChain;
  }

  async unloadVoteChain(voteChain: VoteChain): Promise<void> {
    if (!voteChain) {
      return;
    }

    voteChain.yes.forEach(async (member) => await this.store.unloadRecord(member));
    voteChain.no.forEach(async (member) => await this.store.unloadRecord(member));
    voteChain.remaining.forEach(async (member) => await this.store.unloadRecord(member));
    await this.store.unloadRecord(voteChain.target);
    await this.store.unloadRecord(voteChain.key);
    await this.unloadVoteChain(voteChain.previousVoteChain!);
    await this.store.unloadRecord(voteChain);
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
    'channels/find-or-create': FindOrCreateChannelService;
  }
}
