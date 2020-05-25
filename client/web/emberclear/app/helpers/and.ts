import { helper as buildHelper } from '@ember/component/helper';

export function and(params: any[] /*, hash*/) {
  return params[0] && params[1];
}

export default buildHelper(and);
