import { helper as buildHelper } from '@ember/component/helper';

export function add(params: any[]/*, hash*/) {
  return params.reduce((accum, currentValue) => {
    return accum + currentValue;
  }, 0);
}

export const helper = buildHelper(add);
