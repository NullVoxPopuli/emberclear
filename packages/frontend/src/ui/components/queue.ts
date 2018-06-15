import { helper as buildHelper } from '@ember/component/helper';

// similar to
// https://github.com/DockYard/ember-composable-helpers/blob/master/addon/helpers/queue.js
// but way simpler... cause no promises
export function queue(actions = []) {
  return function(...args) {

    return actions.forEach(action => action(...args));
  };
}

export const helper = buildHelper(queue);
