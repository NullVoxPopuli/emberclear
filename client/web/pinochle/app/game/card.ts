import { v4 as uuid } from 'uuid';

export type Suit = 'hearts' | 'spades' | 'diamonds' | 'clubs';
export type Value = 9 | 'jack' | 'queen' | 'king' | 10 | 'ace';

export const VALUES: Value[] = [9, 'jack', 'queen', 'king', 10, 'ace'];
export const SUITS: Suit[] = ['hearts', 'spades', 'diamonds', 'clubs'];

/**
 *
 *
 */
export class Card {
  id = uuid();
  constructor(public suit: Suit, public value: Value) {}

  toString() {
    return `${this.suit} : ${this.value} :: ${this.id}`;
  }
}

const VALUE_TO_NUMBER = {
  9: 9,
  jack: 10,
  queen: 11,
  king: 12,
  10: 13,
  ace: 14,
};

export function isEqualOrHigherValue(a: Card, b: Card) {
  return a.suit === b.suit && VALUE_TO_NUMBER[a.value] >= VALUE_TO_NUMBER[b.value];
}
