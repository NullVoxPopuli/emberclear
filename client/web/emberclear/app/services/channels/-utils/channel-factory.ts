import type Channel from 'emberclear/models/channel';
import type Vote from 'emberclear/models/vote';
import type VoteChain from 'emberclear/models/vote-chain';
import type Identity from 'emberclear/models/identity';
import { toHex } from 'emberclear/utils/string-encoding';
import type ChannelContextChain from 'emberclear/models/channel-context-chain';

export function buildChannelInfo(channel: Channel): StandardMessage['channelInfo'] {
  return {
    uid: channel.id,
    name: channel.name,
    activeVotes: channel.activeVotes.map((activeVote) => buildVote(activeVote)),
    contextChain: buildChannelContextChain(channel.contextChain),
  };
}

export function buildChannelContextChain(
  contextChain: ChannelContextChain
): StandardChannelContextChain {
  return {
    id: contextChain.id,
    admin: buildChannelMember(contextChain.admin),
    members: contextChain.members.map((member) => buildChannelMember(member)),
    supportingVote:
      !contextChain.previousChain && !contextChain.supportingVote
        ? undefined
        : buildVoteChain(contextChain.supportingVote),
    previousChain:
      !contextChain.previousChain && !contextChain.supportingVote
        ? undefined
        : buildChannelContextChain(contextChain.previousChain),
  };
}

export function buildChannelMember(member: Identity): ChannelMember {
  return {
    id: member.uid,
    name: member.name,
    signingKey: member.publicSigningKeyAsHex,
  };
}

export function buildVote(vote: Vote): StandardVote {
  return {
    id: vote.id,
    voteChain: buildVoteChain(vote.voteChain),
  };
}

export function buildVoteChain(voteChain: VoteChain): StandardVoteChain {
  return {
    id: voteChain.id,
    remaining: voteChain.remaining.map((member) => buildChannelMember(member)),
    yes: voteChain.yes.map((member) => buildChannelMember(member)),
    no: voteChain.no.map((member) => buildChannelMember(member)),
    target: buildChannelMember(voteChain.target),
    action: voteChain.action,
    key: buildChannelMember(voteChain.key),
    previousVoteChain: !voteChain.previousVoteChain
      ? undefined
      : buildVoteChain(voteChain.previousVoteChain),
    signature: toHex(voteChain.signature),
  };
}
