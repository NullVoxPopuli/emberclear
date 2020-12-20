import type { Suit } from 'pinochle/game/card';

export const NAME_MAP = {
  hearts: '♥',
  spades: '♠',
  diamonds: '♦',
  clubs: '♣',
};

export function suitToSymbol(name: Suit) {
  return NAME_MAP[name];
}

// Ember requires default exports for helpers/**
export default suitToSymbol;
