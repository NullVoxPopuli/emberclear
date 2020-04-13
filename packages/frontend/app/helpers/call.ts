import { helper as buildHelper } from '@ember/component/helper';

type PositionalArgs<T> = [Function, ...T[]];

export function call<T>([fn, ...args]: PositionalArgs<T> /*, hash*/) {
  return fn.call(null, ...args);
}

export default buildHelper(call);
