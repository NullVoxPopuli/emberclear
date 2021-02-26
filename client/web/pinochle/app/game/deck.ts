import { assert } from '@ember/debug';

import { Card, SUITS, VALUES } from './card';

import type { Suit } from './card';

/**
 * Returns an array of new cards -- this is the "shuffling"
 * a "deck" is not actually an object or instance of anything
 */
export function newDeck() {
  let deck = [];

  for (let value of VALUES) {
    for (let suit of SUITS) {
      // Pinochle has two of every card
      deck.push(new Card(suit, value));
      deck.push(new Card(suit, value));
    }
  }

  shuffle(deck);
  // return deck.sort(() => Math.random() - 0.5)

  return deck;
}

/**
 * Deck should be pre-shuffled when passed in
 */
export function splitDeck(deck: Card[], splits: number) {
  assert(`Deck must have 48 cards`, deck.length === 48);

  let hands: Card[][] = new Array(splits).fill(splits).map(() => []);
  let remaining = [];

  let handSize;

  if (splits === 3) {
    handSize = 15;
  } else if (splits === 4) {
    handSize = 12;
  } else {
    handSize = Math.floor(deck.length / splits);
  }

  let hand = 0;

  for (let i = 0; i < deck.length; i++) {
    let card = deck[i];

    if (handSize * splits <= i) {
      remaining.push(card);
    } else {
      hands[hand].push(card);

      hand = (hand + 1) % splits;
    }
  }

  return {
    hands,
    remaining,
  };
}

export function sortHand(hand: Card[]) {
  return hand.sort((a, b) => {
    let indexSuitA = SUITS.indexOf(a.suit);
    let indexSuitB = SUITS.indexOf(b.suit);

    let indexValueA = VALUES.indexOf(a.value);
    let indexValueB = VALUES.indexOf(b.value);

    if (indexSuitB === indexSuitA) {
      if (indexValueA < indexValueB) {
        return -1;
      }

      return indexValueB < indexValueA ? 1 : 0;
    }

    if (indexSuitA < indexSuitB) {
      return -1;
    }

    return 1;
  });
}

export function hasSuit(hand: Card[], suit: Suit) {
  let card = hand.find((card) => card.suit === suit);

  return Boolean(card);
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Fisher_and_Yates'_original_method
function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = array[i];

    array[i] = array[j];
    array[j] = temp;
  }
}
