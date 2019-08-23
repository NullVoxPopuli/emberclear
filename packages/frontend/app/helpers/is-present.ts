import { helper as buildHelper } from '@ember/component/helper';
import { isPresent as eIsPresent } from '@ember/utils';

export function isPresent(params: any[] /*, hash*/) {
  return eIsPresent(params[0]);
}

export default buildHelper(isPresent);
