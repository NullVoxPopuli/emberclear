import { tracked } from '@glimmer/tracking';

import { next, prev } from 'pinochle/utils/array';

import type { GameInfo } from '../types';
import type { GuestGameRound } from './game-round';

export class DisplayInfo {
  @tracked declare info: GameInfo;

  constructor(public currentPlayerId: string, public state: GuestGameRound) {}

  update(info: GameInfo, state?: GuestGameRound) {
    this.info = info;

    if (state) {
      this.state = state;
    }
  }

  get left() {
    let leftPlayer = next(this.info.playerOrder, this.currentPlayerId);

    return this.state.playersById[leftPlayer];
  }

  get right() {
    let rightPlayer = prev(this.info.playerOrder, this.currentPlayerId);

    return this.state.playersById[rightPlayer];
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

    return this.state.playersById[across];
  }
}
