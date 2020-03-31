import Task from 'ember-concurrency/task';

export function perform<Return = void>(
  generatorFn: () => Generator<Promise<boolean> | Promise<void>, Return, unknown>
) {
  return ((generatorFn as any) as Task).perform();
}

type ECTask<Args, Return> = (
  ...args: Args
) => Generator<Promise<boolean> | Promise<void>, Return, unknown>;

export function taskFor<Args extends any[], Return = void>(generatorFn: ECTask<Args, Return>) {
  return (generatorFn as any) as Task<Args>;
}
