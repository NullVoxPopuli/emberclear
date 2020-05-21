import Channel from 'emberclear/models/channel';
import Vote from 'emberclear/models/vote';
import VoteChain from 'emberclear/models/vote-chain';
import ChannelContextChain from 'emberclear/models/channel-context-chain';

export async function saveChannel(channel: Channel) {
  await Promise.all(channel.activeVotes.map(async (activeVote) => await saveVote(activeVote)));
  await saveChannelContextChain(channel.contextChain);
  await channel.save();
}

export async function saveVote(vote: Vote) {
  await saveVoteChain(vote.voteChain);
  await vote.save();
}

export async function saveVoteChain(voteChain: VoteChain) {
  if (!voteChain) {
    return;
  }

  await Promise.all(voteChain.yes.map((member) => member.save()));
  await Promise.all(voteChain.no.map((member) => member.save()));
  await Promise.all(voteChain.remaining.map((member) => member.save()));
  await voteChain.target.save();
  await voteChain.key.save();
  await saveVoteChain(voteChain.previousVoteChain!);
  await voteChain.save();
}

export async function saveChannelContextChain(contextChain: ChannelContextChain) {
  if (!contextChain) {
    return;
  }

  await contextChain.admin.save();
  await Promise.all(contextChain.members.map((member) => member.save()));
  await saveVoteChain(contextChain.supportingVote!);
  await saveChannelContextChain(contextChain.previousChain!);
  await contextChain.save();
}
