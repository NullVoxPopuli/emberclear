import { helper as buildHelper } from '@ember/component/helper';

type Action = (...args: any[]) => any;

// similar to
// https://github.com/DockYard/ember-composable-helpers/blob/master/addon/helpers/queue.js
// but way simpler... cause no promises
export function queue(actions: Action[] = []) {
  return function (...args: any[]) {
    return actions.forEach((action: Action) => action(...args));
  };
}

export default buildHelper(queue);
