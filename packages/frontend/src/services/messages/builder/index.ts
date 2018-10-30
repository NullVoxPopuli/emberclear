import Message from "emberclear/data/models/message";
import Identity from "emberclear/data/models/identity/model";

export function buildSender(sender: Identity): RelayJson['sender'] {
  return {
    name: sender.name!,
    uid: sender.uid,
    location: ''
  };
}

export function buildMessage(msg: Message): RelayJson['message'] {
  const { channel, thread, body, contentType } = msg;

  return {
    channel,
    thread,
    body,
    contentType
  };
}

export function build(msg: Message, sender: Identity): RelayJson {
  return {
    type: msg.type,
    target: msg.target,
    client: '',
    client_version: '',
    time_sent: msg.sentAt,
    sender: buildSender(sender),
    message: buildMessage(msg)
  };
}
