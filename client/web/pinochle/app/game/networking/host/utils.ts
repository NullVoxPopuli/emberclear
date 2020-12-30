import type { PlayerInfo } from './types';
import type { Card } from 'pinochle/game/card';

type HasHand = { hand: Card[] };

export function serializePlayer(player: PlayerInfo) {
  return {
    id: player.id,
    name: player.name,
    publicKeyAsHex: player.id,
    isOnline: player.isOnline,
  };
}

export function handById(playersById: Record<string, HasHand>) {
  return Object.entries(playersById).reduce((acc, [id, { hand }]) => {
    acc[id] = hand;

    return acc;
  }, {} as Record<string, Card[]>);
}

export function unwrapObject<T = unknown>(obj: Record<string, T>) {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    acc[k] = v;

    return acc;
  }, {} as Record<string, T>);
}
