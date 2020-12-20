import { cached } from '@glimmer/tracking';

import type { Card, Suit, Value } from 'pinochle/game/card';

interface MeldResultMatch {
  trump?: boolean;
  double?: boolean;
}

type MeldResult = {
  [pointName: string]: {
    value: number;
    matches: {
      [suit in Suit]?: MeldResultMatch;
    };
  };
};

type SuitInfo = {
  values: Value[];
  counts: Map<Value, number>;
};

type ValueInfo = {
  suits: Suit[];
  counts: Map<Suit, number>;
};

export class Meld {
  declare bySuit: Map<Suit, SuitInfo>;
  declare byValue: Map<Value, ValueInfo>;

  constructor(public cards: Card[], public trump?: Suit) {
    this.bySuit = groupBySuit(cards);
    this.byValue = groupByValue(cards);
  }

  get score() {
    return Object.entries(this.matches)
      .map(([_, info]) => info.value)
      .reduce((acc, value) => {
        acc += value;

        return acc;
      }, 0);
  }

  @cached
  get matches(): MeldResult {
    let result: MeldResult = {};

    for (let [name, fn] of Object.entries(calculator)) {
      result[name as keyof typeof calculator] = fn(
        this.cards,
        this.bySuit,
        this.byValue,
        this.trump
      );
    }

    if (this.trump && result.run.value > 0) {
      let localValue = result.marriage.matches[this.trump];

      if (localValue) {
        let isDouble = localValue.double;

        // TODO: store value with group of cards, rather than a total.
        //       total should be calculated in 'score'
        result.marriage.value -= 40;

        if (isDouble && result.run.value === points.run * ROYAL_MULTIPLIER) {
          result.marriage.value -= 40;
        }
      }
    }

    return result;
  }
}

type CalculatorArgs = [Card[], Map<Suit, SuitInfo>, Map<Value, ValueInfo>, Suit | undefined];

/**
 * I'm realizing that maybe the official rules are different
 * from how my family has played all these years
 * https://bicyclecards.com/how-to-play/pinochle-2/
 *
 * For example:
 *  - official rules state that you can't have a marriage and a pinochle
 *    sharing the queen. psh
 *
 * Apparently different rule sites have different values for what
 * "double" of something means. Adding a 0 is def more fun.
 *
 */
const ROYAL_MULTIPLIER = 10;
const calculator = {
  /**
   * Need to keep in mind that a run doessn't count
   * unless it's in trump
   *
   */
  run(...[, bySuit, _, trump]: CalculatorArgs) {
    let value = 0;

    if (!trump) {
      return { value, matches: {} };
    }

    let suit = bySuit.get(trump);

    if (!suit) {
      return { value, matches: {} };
    }

    let jack = suit.counts.get('jack') || 0;
    let queen = suit.counts.get('queen') || 0;
    let king = suit.counts.get('king') || 0;
    let ten = suit.counts.get(10) || 0;
    let ace = suit.counts.get('ace') || 0;

    let isDouble = jack === 2 && queen === 2 && king === 2 && ten === 2 && ace === 2;
    let hasRun = jack > 0 && queen > 0 && king > 0 && ten > 0 && ace > 0;

    if (hasRun) {
      value = points.run;
    }

    if (isDouble) {
      value *= ROYAL_MULTIPLIER;
    }

    return { value, matches: {} };
  },
  aces(...[, , byValue]: CalculatorArgs) {
    let value = 0;

    let hearts = byValue.get('ace')?.counts.get('hearts') || 0;
    let diamonds = byValue.get('ace')?.counts.get('diamonds') || 0;
    let spades = byValue.get('ace')?.counts.get('spades') || 0;
    let clubs = byValue.get('ace')?.counts.get('clubs') || 0;
    let isDouble = hearts === 2 && diamonds === 2 && spades === 2 && clubs === 2;

    if (hearts > 0 && diamonds > 0 && spades > 0 && clubs > 0) {
      value = points.hundredAces;
    }

    // is this a house rule I didn't know about?
    // the pattern fro real rules should be 200, not 1000?
    if (isDouble) {
      value *= ROYAL_MULTIPLIER;
    }

    return { value, matches: {} };
  },

  kings(...[, , byValue]: CalculatorArgs) {
    let value = 0;

    let hearts = byValue.get('king')?.counts.get('hearts') || 0;
    let diamonds = byValue.get('king')?.counts.get('diamonds') || 0;
    let spades = byValue.get('king')?.counts.get('spades') || 0;
    let clubs = byValue.get('king')?.counts.get('clubs') || 0;
    let isDouble = hearts === 2 && diamonds === 2 && spades === 2 && clubs === 2;

    if (hearts > 0 && diamonds > 0 && spades > 0 && clubs > 0) {
      value = points.eightyKings;
    }

    if (isDouble) {
      value *= ROYAL_MULTIPLIER;
    }

    return { value, matches: {} };
  },

  queens(...[, , byValue]: CalculatorArgs) {
    let value = 0;

    let hearts = byValue.get('queen')?.counts.get('hearts') || 0;
    let diamonds = byValue.get('queen')?.counts.get('diamonds') || 0;
    let spades = byValue.get('queen')?.counts.get('spades') || 0;
    let clubs = byValue.get('queen')?.counts.get('clubs') || 0;
    let isDouble = hearts === 2 && diamonds === 2 && spades === 2 && clubs === 2;

    if (hearts > 0 && diamonds > 0 && spades > 0 && clubs > 0) {
      value = points.sixtyQueens;
    }

    if (isDouble) {
      value *= ROYAL_MULTIPLIER;
    }

    return { value, matches: {} };
  },

  jacks(...[, , byValue]: CalculatorArgs) {
    let value = 0;

    let hearts = byValue.get('jack')?.counts.get('hearts') || 0;
    let diamonds = byValue.get('jack')?.counts.get('diamonds') || 0;
    let spades = byValue.get('jack')?.counts.get('spades') || 0;
    let clubs = byValue.get('jack')?.counts.get('clubs') || 0;
    let isDouble = hearts === 2 && diamonds === 2 && spades === 2 && clubs === 2;

    if (hearts > 0 && diamonds > 0 && spades > 0 && clubs > 0) {
      value = points.fortyJacks;
    }

    if (isDouble) {
      value *= ROYAL_MULTIPLIER;
    }

    return { value, matches: {} };
  },

  pinochle(...[, bySuit]: CalculatorArgs) {
    let value = 0;

    let jacks = bySuit.get('diamonds')?.counts.get('jack') || 0;
    let queens = bySuit.get('spades')?.counts.get('queen') || 0;
    let isDouble = jacks === 2 && queens === 2;

    if (jacks > 0 && queens > 0 && !isDouble) {
      value = points.pinochle;
    }

    if (isDouble) {
      value = points.doublePinochle;
    }

    return { value, matches: {} };
  },

  marriage(...[, bySuit, _, trump]: CalculatorArgs) {
    let value = 0;
    let matches = {} as Record<Suit, MeldResultMatch>;

    for (let [suit, info] of bySuit.entries()) {
      let queens = info.counts.get('queen') || 0;
      let kings = info.counts.get('king') || 0;

      if (queens > 0 && kings > 0) {
        let isTrump = suit === trump;
        let multiplier = queens === 2 && kings === 2 ? 2 : 1;
        let result: MeldResultMatch = { trump: isTrump };

        if (multiplier === 2) {
          result.double = true;
        }

        matches[suit as Suit] = result;

        if (isTrump) {
          value += multiplier * points['marriageOfTrump'];
        } else {
          value += multiplier * points['marriage'];
        }
      }
    }

    return { value, matches };
  },

  nineOfTrump(...[, , byValue, trump]: CalculatorArgs) {
    let nines = (trump && byValue.get(9)?.counts.get(trump)) || 0;

    return { value: nines * points.nineOfTrump, matches: {} };
  },
};

const points = {
  run: 150,
  marriage: 20,
  marriageOfTrump: 40,
  pinochle: 30,
  doublePinochle: 300,
  nineOfTrump: 10,
  hundredAces: 100,
  thousandAces: 1000,
  eightyKings: 80,
  sixtyQueens: 60,
  fortyJacks: 40,
  roundHouse: 240,
};

export const pointKeyToName = {
  marriage: 'Marriage',
};

function groupBySuit(cards: Card[]) {
  return cards.reduce((acc, card) => {
    let info = acc.get(card.suit) || ({ values: [], counts: new Map() } as SuitInfo);

    info.values.push(card.value);
    info.counts.set(card.value, (info.counts.get(card.value) || 0) + 1);

    if (!acc.get(card.suit)) {
      acc.set(card.suit, info);
    }

    return acc;
  }, new Map<Suit, SuitInfo>());
}

function groupByValue(cards: Card[]) {
  return cards.reduce((acc, card) => {
    let info = acc.get(card.value) || ({ suits: [], counts: new Map() } as ValueInfo);

    info.suits.push(card.suit);
    info.counts.set(card.suit, (info.counts.get(card.suit) || 0) + 1);

    if (!acc.get(card.value)) {
      acc.set(card.value, info);
    }

    return acc;
  }, new Map<Value, ValueInfo>());
}
