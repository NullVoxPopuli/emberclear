import Task from 'ember-concurrency/task';

export function perform<Return = void>(
  generatorFn: () => Generator<Promise<boolean> | Promise<void>, Return, unknown>
) {
  return ((generatorFn as any) as Task).perform();
}

export function taskFor<T>(generatorFn: () => T) {
  return (generatorFn as any) as Task<Parameters<T>>;
}
