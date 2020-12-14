import { helper } from '@ember/component/helper';

type PositionalParams = [unknown];

export function isNumber([maybe]: PositionalParams /*, hash*/) {
  return Number.isFinite(maybe);
}

export default helper(isNumber);
