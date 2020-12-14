import { helper } from '@ember/component/helper';

type PositionalParams = unknown[];

export default helper(function eq([a, b]: PositionalParams /*, hash*/) {
  return a === b;
});
