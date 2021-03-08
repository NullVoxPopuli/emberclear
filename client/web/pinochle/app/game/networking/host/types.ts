import type { Heartbeat, Join, Ping, Play, Pong, SerializablePlayer } from '../types';
import type { SerializedRound } from './game-round';
import type RSVP from 'rsvp';

export interface WithId {
  fromId: string;
}
export type MessageFromGuest = WithId & (Heartbeat | Join | Ping | Play | Pong);
/* sub info in here */

export type MessageFromUi = { type: 'UI__START_GAME' };

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
