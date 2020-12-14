import { helper } from '@ember/component/helper';

type PositionalArgs = [unknown[], unknown];

export default helper(function contains([list, element]: PositionalArgs /*, hash*/) {
  return list.includes(element);
});
