import { helper as buildHelper } from '@ember/component/helper';

export function first8(params: any[]/*, hash*/) {
  return params[0].substring(0, 8);
}

export const helper = buildHelper(first8);
