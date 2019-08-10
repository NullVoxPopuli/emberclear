import Message, { TARGET, TYPE } from './model';

export function selectUnreadDirectMessages(messages: Message[], fromId: string) {
  const filtered = selectUnreadMessages(messages).filter(m => {
    return m.from === fromId;
  });

  return filtered;
}

export function selectUnreadMessages(messages: Message[]) {
  const filtered = messages.filter(m => {
    return (
      m.unread && m.target !== TARGET.NONE && m.target !== TARGET.MESSAGE && m.type !== TYPE.PING
    );
  });

  return filtered;
}

export async function markAsRead(message: Message) {
  message.set('readAt', new Date());

  await message.save();
}
