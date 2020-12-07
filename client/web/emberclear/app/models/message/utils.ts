import type Message from '../message';
import { TARGET, TYPE } from '../message';

type RecordArray<T> = Array<T>;

export function selectUnreadDirectMessages(
  messages: Message[] | RecordArray<Message> | TODO<any>,
  fromId: string
): Message[] {
  const filtered = selectUnreadMessages(messages).filter((m) => {
    return m.from === fromId;
  });

  return filtered;
}

export function selectUnreadMessages(
  messages: Message[] | RecordArray<Message> | TODO<any>
): Message[] {
  const filtered = messages.filter((m: Message) => {
    return (
      // ember-data in-flight messages
      // don't yet have any fields
      m.from &&
      m.unread &&
      // ensure the correct type of message
      m.target !== TARGET.NONE &&
      m.target !== TARGET.MESSAGE &&
      m.type !== TYPE.PING
    );
  });

  return filtered;
}

export async function markAsRead(message: Message) {
  message.readAt = new Date();

  await message.save();
}

export function messagesForDM(
  messages: RecordArray<Message> | TODO<any>,
  me: string,
  chattingWithId: string
): Message[] {
  let result = messages.filter((message: Message) => {
    return isMessageDMBetween(message, me, chattingWithId);
  });

  return result;
}

export function isMessageDMBetween(message: Message, me: string, chattingWithId: string) {
  const isRelevant =
    message.target === TARGET.WHISPER &&
    message.type === TYPE.CHAT &&
    // we sent this message to someone else (this could incude ourselves)
    ((message.to === chattingWithId && message.from === me) ||
      // we received a message from someone else to us (including from ourselves)
      (message.from === chattingWithId && message.to === me));

  return isRelevant;
}
