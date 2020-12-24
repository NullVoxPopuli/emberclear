import Route from '@ember/routing/route';

import { newDeck, sortHand, splitDeck } from 'pinochle/game/deck';

export default class GameRoute extends Route {
  async model() {
    let deck = newDeck();
    let dealt = splitDeck(deck, 3);
    let unsorted = dealt.hands[0];
    let hand = sortHand(unsorted);

    return { hand };
  }
}
