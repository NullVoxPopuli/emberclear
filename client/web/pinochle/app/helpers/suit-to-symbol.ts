import { helper } from '@ember/component/helper';

import type { Suit } from 'pinochle/utils/deck';

export const NAME_MAP = {
  hearts: '♥',
  spades: '♠',
  diamonds: '♦',
  clubs: '♣',
};

type PositionalParams = [Suit];

export function suitToSymbol([name]: PositionalParams /*, hash*/) {
  return NAME_MAP[name];
}

export default helper(suitToSymbol);
