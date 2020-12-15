import { helper } from '@ember/component/helper';

type PositionalArgs = [unknown[], unknown];

export function contains([list, element]: PositionalArgs /*, hash*/) {
  return list.includes(element);
}

export default helper(contains);
