// https://github.com/DockYard/ember-composable-helpers/blob/master/addon/helpers/toggle.js
import { helper as buildHelper } from '@ember/component/helper';

export function and(params: any[] /*, hash*/) {
  return params[0] && params[1];
}

export default buildHelper(and);
