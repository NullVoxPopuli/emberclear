import { newDeck, splitDeck } from '../deck';

import type { Card } from '../card';
import type { GuestPlayer } from './types';

export class GameRound {
  hands: { [key: string]: Card[] } = {};
  blind: Card[] = [];

  constructor(protected players: GuestPlayer[]) {
    this.deal();
  }

  deal() {
    let deck = newDeck();
    let { hands, remaining } = splitDeck(deck, this.players.length);

    this.blind = remaining;

    for (let i = 0; i < this.players.length; i++) {
      let player = this.players[i];

      this.hands[player.publicKeyAsHex] = hands[i];
    }
  }
}
