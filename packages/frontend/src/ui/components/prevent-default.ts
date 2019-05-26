import { helper as buildHelper } from '@ember/component/helper';

type PositionalArgs = [(...args: any) => void];

export function preventDefault([fn]: PositionalArgs /*, hash*/) {
  return (...args: any[]) => {
    const firstArg = args[0];

    if (firstArg && firstArg.preventDefault) {
      firstArg.preventDefault();
    }

    return fn(...args);
  };
}

export const helper = buildHelper(preventDefault);
