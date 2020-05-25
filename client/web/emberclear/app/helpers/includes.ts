import { helper as buildHelper } from '@ember/component/helper';

type PositionalArgs<T> = [T[], T];

export function includes<T>([collection, element]: PositionalArgs<T> /*, hash*/) {
  return collection.includes(element);
}

export default buildHelper(includes);
