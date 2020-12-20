import { isEqualOrHigherValue } from '../card';
import { hasSuit } from '../deck';

import type { Card, Suit } from '../card';
import type { Trick } from '../trick';

/**
 * NOTE: for scenarios where the suit does not match the last
 *       card in the trick, more information is required than
 *       just the played card.
 *
 * TODO?: pass the whole hand?
 *
 */
export function isValidMove(trick: Trick, card: Card, trump: Suit) {
  return availableMoves(trick, [card], trump).includes(card);
}

export function availableMoves(trick: Trick, hand: Card[], trump: Suit) {
  if (trick.isEmpty) {
    return hand;
  }

  let hasMatchingSuit = hasSuit(hand, trick.suit);

  if (!hasMatchingSuit) {
    let hasTrump = hasSuit(hand, trump);

    if (hasTrump) {
      return hand.filter((card) => card.suit === trump);
    }

    return hand;
  }

  let matchingSuits = hand.filter((card) => isEqualOrHigherValue(card, trick.last));

  if (matchingSuits.length) {
    return matchingSuits;
  }

  return hand.filter((card) => isEqualOrHigherValue(card, trick.last));
}
