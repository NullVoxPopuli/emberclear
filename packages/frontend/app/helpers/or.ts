import { helper as buildHelper } from '@ember/component/helper';

export function or(params: any[] /*, hash*/) {
  let result = false;

  for (let i of params) {
    result = result || i;
  }

  return result;
}

export default buildHelper(or);
