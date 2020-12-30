import type { FromHostMessage } from '../types';

export function verifyMessage(msg: FromHostMessage) {
  switch (msg.type) {
    case 'GUEST_UPDATE':
      return 'info' in msg && 'players' in msg.info && 'playerOrder' in msg.info;
    default:
      return true;
  }
}
