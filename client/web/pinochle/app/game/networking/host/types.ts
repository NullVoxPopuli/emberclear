import type { SerializablePlayer } from '../types';
import type { SerializedRound } from './game-round';
import type RSVP from 'rsvp';

export type MessageFromGuest =
  | { type: 'GUEST_HEARTBEAT' }
  | { type: 'JOIN' }
  | { type: 'PLAY' /* sub info in here */ };

export type PlayerInfo = {
  id: string;
  name: string;
  publicKeyAsHex: string;
  publicKey: Uint8Array;
  onlineCheck?: RSVP.Deferred<unknown>;
  isOnline?: boolean;
};

export type SerializedHost = {
  id: string;
  privateKey: string;
  players: SerializablePlayer[];
  gameRound: SerializedRound;
};

