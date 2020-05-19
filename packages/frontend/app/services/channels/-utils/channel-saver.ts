import Channel from 'emberclear/models/channel';
import Vote from 'emberclear/models/vote';
import VoteChain from 'emberclear/models/vote-chain';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import Identity from 'emberclear/models/identity';

export async function saveChannel(channel: Channel) {
  console.error('before saving channel admin');
  await channel.admin.save();
  console.error('after saving channel admin');

  let membersPromises: Promise<Identity>[] = [];
  channel.members.forEach((member) => membersPromises.push(member.save()));
  await Promise.all(membersPromises);

  console.error('before activeVotes');
  let activeVotesPromises: Promise<void>[] = [];
  channel.activeVotes.forEach((activeVote) => activeVotesPromises.push(saveVote(activeVote)));
  await Promise.all(activeVotesPromises);

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

  let yesPromises: Promise<Identity>[] = [];
  voteChain.yes.forEach((member) => yesPromises.push(member.save()));
  await Promise.all(yesPromises);

  let noPromises: Promise<Identity>[] = [];
  voteChain.no.forEach((member) => noPromises.push(member.save()));
  await Promise.all(noPromises);

  let remainingPromises: Promise<Identity>[] = [];
  voteChain.remaining.forEach((member) => remainingPromises.push(member.save()));
  await Promise.all(remainingPromises);

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

  let membersPromises: Promise<Identity>[] = [];
  contextChain.members.forEach((member) => membersPromises.push(member.save()));
  await Promise.all(membersPromises);

  console.error('before saving supporting vote');
  await saveVoteChain(contextChain.supportingVote!);
  console.error('before saving previous chain');
  await saveChannelContextChain(contextChain.previousChain!);
  await contextChain.save();
}
