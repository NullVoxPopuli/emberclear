import { helper } from '@ember/component/helper';

type PositionalParams = [unknown];

export default helper(function isNumber([maybe]: PositionalParams /*, hash*/) {
  return Number.isFinite(maybe);
});
