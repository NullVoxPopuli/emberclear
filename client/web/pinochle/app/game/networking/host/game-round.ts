import { newDeck, splitDeck } from 'pinochle/game/deck';

import type { GamePhase } from '../constants';
import type { GuestPlayer } from '../types';
import type { PlayerInfo } from './types';
import type { Card, Suit } from 'pinochle/game/card';

export type SerializedRound = {
  hands: Record<string, Card[]>;
  blind: Card[];
  playerOrder: string[];
  playerWhoTookTheBid: string;
  currentPlayer: string;
  phase: GamePhase;
  bid: number;
  trump: Suit;
};

export class GameRound {
  static loadFrom(players: PlayerInfo[], data: SerializedRound) {
    let round = new GameRound(players);

    round.hands = data.hands;
    round.blind = data.blind;
    round.playerOrder = data.playerOrder;
    round.playerWhoTookTheBid = data.playerWhoTookTheBid;
    round.currentPlayer = data.currentPlayer;
    round.phase = data.phase;
    round.bid = data.bid;
    round.trump = data.trump;

    return round;
  }

  blind: Card[] = [];
  phase: GamePhase = 'meld';
  bid?: number;
  trump?: Suit;
  playerWhoTookTheBid?: string;
  hands: { [key: string]: Card[] } = {};
  declare playerOrder: string[];
  declare currentPlayer: string;

  /**
   * players must be passed in in-order
   *
   */
  constructor(protected players: PlayerInfo[]) {
    this.deal();
  }

  get info() {
    let { trump, bid, playerWhoTookTheBid } = this;

    return {
      trump,
      bid,
      playerWhoTookTheBid,
      playerOrder: this.playerOrder,
      players: this.players.map((player) => ({
        name: player.name,
        id: player.publicKeyAsHex,
      })),
    };
  }

  deal() {
    let deck = newDeck();
    let { hands, remaining } = splitDeck(deck, this.players.length);

    this.blind = remaining;

    for (let i = 0; i < this.players.length; i++) {
      let player = this.players[i];

      this.hands[player.publicKeyAsHex] = hands[i];
    }

    this.playerOrder = this.players.map((player) => player.publicKeyAsHex);
    this.currentPlayer = this.playerOrder[0];
  }

  toJSON() {
    let { hands, blind, playerOrder, playerWhoTookTheBid, currentPlayer, phase, bid, trump } = this;

    return {
      hands,
      blind,
      playerOrder,
      playerWhoTookTheBid,
      currentPlayer,
      phase,
      bid,
      trump,
    };
  }
}
