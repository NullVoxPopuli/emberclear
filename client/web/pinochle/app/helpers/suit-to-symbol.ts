import { helper } from '@ember/component/helper';

const NAME_MAP = {
  hearts: '♥',
  spades: '♠',
  diamonds: '♦',
  clubs: '♣',
};

type PositionalParams = [keyof typeof NAME_MAP];

export default helper(function suitToSymbol([name]: PositionalParams /*, hash*/) {
  return NAME_MAP[name];
});
