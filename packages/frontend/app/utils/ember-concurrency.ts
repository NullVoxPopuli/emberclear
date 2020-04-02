import Task from 'ember-concurrency/task';

type ECTask<Args extends Array<any>, Return> = (
  ...args: Args
) => Generator<any /* potentially yielded types */, Return, unknown>;

export function taskFor<Args extends any[], Return = void>(generatorFn: ECTask<Args, Return>) {
  return (generatorFn as any) as Task<Args, Return>;
}
