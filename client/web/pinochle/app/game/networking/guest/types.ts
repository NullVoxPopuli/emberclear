import type { Ping, Pong } from '../types';

export interface WithId {
  fromId: string;
}

export type MessageFromHost = WithId & (Ping | Pong);
