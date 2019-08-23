// https://github.com/DockYard/ember-composable-helpers/blob/master/addon/helpers/toggle.js
import { helper as buildHelper } from '@ember/component/helper';
import { get, set } from '@ember/object';
import { isPresent } from '@ember/utils';

function nextIndex(length: number, currentIdx: number) {
  if (currentIdx === -1 || currentIdx + 1 === length) {
    return 0;
  }

  return currentIdx + 1;
}

type PositionalArguments = [string, any, ...any[]];

export function toggle([prop, obj, ...values]: PositionalArguments) {
  return function() {
    let currentValue = get(obj, prop);

    if (isPresent(values)) {
      let currentIdx = values.indexOf(currentValue);
      let nextIdx = nextIndex(get(values, 'length'), currentIdx);

      return set(obj, prop, values[nextIdx]);
    }

    return set(obj, prop, !currentValue);
  };
}

export default buildHelper(toggle);
