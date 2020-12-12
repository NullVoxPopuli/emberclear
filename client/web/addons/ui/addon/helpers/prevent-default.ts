import { helper as buildHelper } from '@ember/component/helper';

type PositionalArgs = [(...args: unknown[]) => void];

export function preventDefault([fn]: PositionalArgs /*, hash*/) {
  return (...args: unknown[]) => {
    const firstArg = args[0];

    if (firstArg instanceof Event) {
      firstArg.preventDefault();
    }

    return fn(...args);
  };
}

export default buildHelper(preventDefault);
