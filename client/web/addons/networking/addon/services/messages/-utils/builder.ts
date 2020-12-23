import type Message from 'emberclear/models/message';

interface Sender {
  name: string;
  uid: string;
}

export function buildSender(sender: Sender): StandardMessage['sender'] {
  return {
    name: sender.name,
    uid: sender.uid,
    location: '',
  };
}

export function buildMessage(msg: Message): StandardMessage['message'] {
  const { body, contentType } = msg;

  return {
    body,
    contentType,
  };
}

export function build(msg: Message, sender: Sender): RelayJson {
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
