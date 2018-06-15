// https://github.com/DockYard/ember-composable-helpers/blob/master/addon/helpers/toggle.js
import { helper as buildHelper } from '@ember/component/helper';

export function not(params: any[]/*, hash*/) {
  return !params[0];
}

export const helper = buildHelper(not);
