export type Suit = 'hearts' | 'spades' | 'diamonds' | 'clubs';
export type Value = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'jack' | 'queen' | 'king' | 10 | 'ace';

export type Hand = {
  [suit in Suit]: Value;
};
