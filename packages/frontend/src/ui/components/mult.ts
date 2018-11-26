import { helper as buildHelper } from '@ember/component/helper';

export function mult(params: any[]/*, hash*/) {
  return params[0] * params[1];
}

export const helper = buildHelper(mult);
