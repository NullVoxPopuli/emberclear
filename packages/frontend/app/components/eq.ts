import { helper as buildHelper } from '@ember/component/helper';

export function eq(params: any[] /*, hash*/) {
  return params[0] === params[1];
}

export const helper = buildHelper(eq);
