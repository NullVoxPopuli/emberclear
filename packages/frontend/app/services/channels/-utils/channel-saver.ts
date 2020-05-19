import Channel from 'emberclear/models/channel';
import Vote from 'emberclear/models/vote';
import VoteChain from 'emberclear/models/vote-chain';
import ChannelContextChain from 'emberclear/models/channel-context-chain';

export async function saveChannel(channel: Channel) {
  console.error('before saving channel admin');
  await channel.admin.save();
  console.error('after saving channel admin');
  channel.members.forEach(async (member) => await member.save());
  console.error('before activeVotes');
  channel.activeVotes.forEach(async (activeVote) => await saveVote(activeVote));
  console.error('before contextChain');
  await saveChannelContextChain(channel.contextChain);
  console.error('before saving channel object');
  await channel.save();
  console.error('after saving channel object');
}

export async function saveVote(vote: Vote) {
  await saveVoteChain(vote.voteChain);
  await vote.save();
}

export async function saveVoteChain(voteChain: VoteChain) {
  if (voteChain === undefined) {
    console.error('got to base of voteChain');
    return;
  }

  voteChain.yes.forEach(async (member) => await member.save());
  voteChain.no.forEach(async (member) => await member.save());
  voteChain.remaining.forEach(async (member) => await member.save());
  await voteChain.target.save();
  await voteChain.key.save();
  await saveVoteChain(voteChain.previousVoteChain!);
  console.error('save voteChain');
  await voteChain.save();
  console.error('finishing votechain save');
}

export async function saveChannelContextChain(contextChain: ChannelContextChain) {
  if (contextChain === undefined) {
    return;
  }

  await contextChain.admin.save();
  contextChain.members.forEach(async (member) => await member.save());
  console.error('before saving supporting vote');
  await saveVoteChain(contextChain.supportingVote!);
  console.error('before saving previous chain');
  await saveChannelContextChain(contextChain.previousChain!);
  await contextChain.save();
}
