import { helper } from '@ember/component/helper';

type PositionalParams = unknown[];

export function eq([a, b]: PositionalParams /*, hash*/) {
  return a === b;
}

export default helper(eq);
