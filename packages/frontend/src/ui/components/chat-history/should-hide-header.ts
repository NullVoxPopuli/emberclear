import { helper as buildHelper } from '@ember/component/helper';
import Message from 'emberclear/data/models/message';

type HelperArgs = [
  Message[],
  Message,
  number
]

export function shouldHideHeader(params: HelperArgs/*, hash*/) {
  const [messages, message, index] = params;
  if (index === 0) return false;

  const previousMessage = messages.objectAt(index - 1);

  if (!previousMessage) return false;

  const fromSamePerson = message.from === previousMessage.from;
  const inSameChannel = message.channel === previousMessage.channel;
  const inSameThread = message.thread === message.thread;

  return (
    fromSamePerson
    && inSameChannel
    && inSameThread
  );
}

export const helper = buildHelper(shouldHideHeader);
