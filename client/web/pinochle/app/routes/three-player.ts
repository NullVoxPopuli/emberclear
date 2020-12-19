import Route from '@ember/routing/route';

import { newDeck, sortHand, splitDeck } from 'pinochle/utils/deck';

const NUM_PLAYERS = 3;

export default class ThreePlayerRoute extends Route {
  async model() {
    let deck = newDeck();
    let dealt = splitDeck(deck, NUM_PLAYERS);
    let unsorted = dealt.hands[0];
    let hand = sortHand(unsorted);

    return {
      numPlayers: NUM_PLAYERS,
      hand,
    };
  }
}
