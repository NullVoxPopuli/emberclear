import { cached } from '@glimmer/tracking';

import type { Card } from 'pinochle/utils/deck';

export class Meld {
  constructor(public cards: Card[]) {}

  get score() {
    return Object.entries(this.matches)
      .map((_, match) => match.value)
      .reduce((acc, value) => {
        acc += value;

        return acc;
      }, 0);
  }

  @cached
  get matches() {
    let result = {};

    for (let [name, fn] of Object.entries(calculator)) {
    }

    if (result['1000aces']) {
      delete result['100aces'];
    }

    return result;
  }
}

/**
 * I'm realizing that maybe the official rules are different
 * from how my family has played all these years
 * https://bicyclecards.com/how-to-play/pinochle-2/
 *
 * For example:
 *  - official rules state that you can't have a marriage and a pinochle
 *    sharing the queen. psh
 *
 */
const calculator = {
  // is this a house rule I didn't know about?
  '1000aces'() {},

  '100aces'() {},

  '80kings'() {},

  '60queens'() {},

  '40jacks'() {},

  pinochle() {},

  doublePinochle() {},

  marriage() {},

  '9OfTrump'() {},
  flushOfTrump() {},
  straightOfTrump() {},
  marriageOfTrump() {},
};
