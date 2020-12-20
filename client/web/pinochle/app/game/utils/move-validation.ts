import type { Card, Suit } from '../card';
import type { Trick } from '../trick';

export function isValidMove(trick: Trick, card: Card, trump: Suit) {}

export function availableMoves(trick: Trick, hand: Card[], trump: Suit) {}
