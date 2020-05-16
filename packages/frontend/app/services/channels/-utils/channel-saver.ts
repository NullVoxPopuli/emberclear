import Channel from 'emberclear/models/channel';
import Vote from 'emberclear/models/vote';
import VoteChain from 'emberclear/models/vote-chain';
import ChannelContextChain from 'emberclear/models/channel-context-chain';

export async function saveChannel(channel: Channel) {
  await channel.admin.save();
  channel.members.forEach(async (member) => await member.save());
  channel.activeVotes.forEach(async (activeVote) => await saveVote(activeVote));
  await saveChannelContextChain(channel.contextChain);
  await channel.save();
}

export async function saveVote(vote: Vote) {
  await saveVoteChain(vote.voteChain);
  await vote.save();
}

export async function saveVoteChain(voteChain: VoteChain) {
  if (voteChain === undefined) {
    return;
  }

  voteChain.yes.forEach(async (member) => await member.save());
  voteChain.no.forEach(async (member) => await member.save());
  voteChain.remaining.forEach(async (member) => await member.save());
  await voteChain.target.save();
  await voteChain.key.save();
  await saveVoteChain(voteChain.previousVoteChain!);
  await voteChain.save();
}

export async function saveChannelContextChain(contextChain: ChannelContextChain) {
  if (contextChain === undefined) {
    return;
  }

  await contextChain.admin.save();
  contextChain.members.forEach(async (member) => await member.save());
  await saveVoteChain(contextChain.supportingVote);
  await saveChannelContextChain(contextChain.previousChain!);
  await contextChain.save();
}
