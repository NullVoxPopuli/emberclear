import { TARGET, TYPE } from '@emberclear/networking/models/message';
import { getService } from '@emberclear/test-helpers/test-support';

import type { Identity } from '@emberclear/local-account';

export async function createMessage(to: Identity, from: Identity, body: string, attributes = {}) {
  let store = getService('store');

  let record = store.createRecord('message', {
    body,
    to: to.uid,
    from: from.uid,
    type: TYPE.CHAT,
    target: TARGET.WHISPER,
    sentAt: new Date(),
    receivedAt: new Date(),
    readAt: undefined,
    queueForResend: false,
    sender: from,
    ...attributes,
  });

  await record.save();

  return record;
}
