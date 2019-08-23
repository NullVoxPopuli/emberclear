import { helper as buildHelper } from '@ember/component/helper';
import { htmlSafe as makeSafe } from '@ember/string';

export function htmlSafe(params: any[] /*, hash*/) {
  return makeSafe(params[0]);
}

export default buildHelper(htmlSafe);
