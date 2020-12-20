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
