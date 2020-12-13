import { helper } from '@ember/component/helper';

import type { Suit } from 'pinochle/utils/deck';

const NAME_MAP = {
  hearts: '♥',
  spades: '♠',
  diamonds: '♦',
  clubs: '♣',
};

type PositionalParams = [Suit];

export default helper(function suitToSymbol([name]: PositionalParams /*, hash*/) {
  return NAME_MAP[name];
});
