import { tracked } from '@glimmer/tracking';

import { next, prev } from 'pinochle/utils/array';

import type { GameInfo, SerializablePlayer } from './types';

export class DisplayInfo {
  @tracked declare info: GameInfo;

  declare playersById: Record<string, SerializablePlayer>;

  constructor(public currentPlayerId: string) {}

  update(info: GameInfo) {
    this.info = info;
    this.playersById = this.info.players.reduce((acc, curr) => {
      acc[curr.id] = curr;

      return acc;
    }, {} as Record<string, SerializablePlayer>);
  }

  get left() {
    let leftPlayer = next(this.info.playerOrder, this.currentPlayerId);

    return this.playersById[leftPlayer];
  }

  get right() {
    let rightPlayer = prev(this.info.playerOrder, this.currentPlayerId);

    return this.playersById[rightPlayer];
  }

  get top() {
    let playerIds = this.info.playerOrder;

    if (playerIds.length === 3) {
      if (this.info.playerWhoTookTheBid) {
        return false;
      }

      return {
        name: 'Blind',
        blind: true,
        cards: [],
      };
    }

    let across = next(playerIds, next(playerIds, this.currentPlayerId));

    return this.playersById[across];
  }
}
