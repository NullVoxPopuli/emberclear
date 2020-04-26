import Task from 'ember-concurrency/task';
import { didCancel } from 'ember-concurrency';
import { Event } from 'xstate';

type ECTask<Args extends Array<any>, Return> = (
  ...args: Args
) => Generator<any /* potentially yielded types */, Return, unknown>;

export function taskFor<Args extends any[], Return = void>(generatorFn: ECTask<Args, Return>) {
  return (generatorFn as any) as Task<Args, Return>;
}

/**
 * Wraps an ember-concurrency task into an XState service.
 *
 *     Machine({
 *       id: 'example',
 *       initial: 'fetch',
 *       states: {
 *         'fetch': {
 *           invoke: { src: 'fetch' },
 *           on: {
 *             DONE: 'done',
 *             CANCEL: 'cancelled',
 *             ERROR: 'errored',
 *           },
 *         },
 *         'cancelled': { type: 'final' },
 *         'errored': { type: 'final' },
 *         'done': { type: 'final' },
 *       },
 *     }).withConfig({
 *       services: {
 *         fetch: taskService(this.fetchTask),
 *       },
 *     });
 *
 * @function
 * @param {TaskProp} taskProp the task property (not instance) to call perform() on
 * @return {CallbackService} an XState compatable callback based service
 */
export function taskService<TEvent extends Event<any>, Args extends any[], Return = void>(
  taskProp: ECTask<Args, Return>
): (...args: Args) => (callback: TEvent) => void {
  return (...args: Args) => (callback) => {
    let taskInstance = taskFor(taskProp).perform(...args);

    taskInstance.then(
      (data: TEvent['data']) => callback({ type: 'DONE', data }),
      (error) =>
        didCancel(error) ? callback({ type: 'CANCEL' }) : callback({ type: 'ERROR', error })
    );

    return () => taskInstance.cancel();
  };
}
