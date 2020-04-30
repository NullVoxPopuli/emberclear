import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import VoteVerifier from './vote-verifier';
import CurrentUserService from '../current-user';
import ContactManager from '../contact-manager';
import VoteChain from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';

export default class ReceivedChannelVoteHandler extends Service {
  @service store!: StoreService;
  @service('channels/vote-verifier') voteVerifier!: VoteVerifier;
  @service currentUser!: CurrentUserService;
  @service contactManager!: ContactManager;

  public async handleChannelVote(message: Message, raw: StandardMessage) {
    // check if channel exists
    let existingChannel = undefined;
    try {
      existingChannel = await this.store.findRecord('channel', raw.channelInfo!.uid);
    } catch (e) {
      // TODO: handle if user not in channel
    }
    // check if sender is in channel
    if (existingChannel?.members.contains(message.sender!)) {
      let sentVote = message.metadata as StandardVote;
      let existingVote = undefined;

      try {
        existingVote = await this.store.findRecord('vote', sentVote.id);
      } catch (e) {
        // TODO
      }

      if (existingVote !== undefined) {
        let channelVote = existingChannel.activeVotes.find(
          (activeVote) => activeVote.id === sentVote.id
        );
        let voteChain = await this.findOrCreateVoteChain(sentVote.voteChain);

        // TODO check vote havn't been tampered with
        if (voteChain !== undefined && !this.voteVerifier.verify(voteChain)) {
          // TODO
        }
        // add vote to channel context
      }
    }
    return message;
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
    'channels/vote-handler': ReceivedChannelVoteHandler;
  }
}
