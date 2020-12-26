import type { Message } from '@emberclear/networking';

interface Sender {
  name: string;
  uid: string;
}

export function buildSender(sender: Sender) {
  return {
    name: sender.name,
    uid: sender.uid,
    location: '',
  };
}

export function buildMessage(msg: Message) {
  const { body, contentType } = msg;

  return {
    body,
    contentType,
  };
}

export function build(msg: Message, sender: Sender) {
  return {
    id: msg.id,
    to: msg.to,
    type: msg.type,
    target: msg.target,
    client: '',
    ['client_version']: '',
    ['time_sent']: msg.sentAt,
    sender: buildSender(sender),
    message: buildMessage(msg),
  };
}
