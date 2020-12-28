import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { TrackedObject } from 'tracked-built-ins';

import { fromHex } from '@emberclear/encoding/string';

import type { GamePhase } from '../constants';
import type { GameInfo, GameResult, GameState, GuestPlayer, SerializablePlayer } from '../types';
import type { Card } from 'pinochle/game/card';

export class GuestGameRound {
  @tracked hand: Card[] = [];
  @tracked currentPlayer?: string;
  @tracked scoreHistory: GameResult[] = [];
  @tracked gamePhase: GamePhase = 'meld';
  @tracked info?: GameInfo;
  @tracked playersById: Record<string, GuestPlayer> = new TrackedObject();

  @cached
  get playerList() {
    return Object.values(this.playersById);
  }

  @cached
  get playerOrder() {
    if (!this.info) {
      return [];
    }

    return this.info.playerOrder.map((id) => {
      return this.playersById[id];
    });
  }

  @action
  update({ currentPlayer, hand, scoreHistory, info, gamePhase }: GameState) {
    this._updatePlayers(info);

    Object.assign(this, {
      currentPlayer,
      hand,
      scoreHistory,
      info,
      gamePhase,
    });
  }

  @action
  _updatePlayers(msg: { players: SerializablePlayer[] }) {
    for (let { name, id } of msg.players) {
      this.playersById[id] = {
        id,
        name,
        publicKeyAsHex: id,
        publicKey: fromHex(id),
      };
    }
  }
}
