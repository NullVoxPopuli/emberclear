import { didCancel } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';

import type { Event } from 'xstate';

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
export function taskService<TEvent extends Event<any>, Args extends unknown[], Return = void>(
  taskProp: (...args: Args) => Promise<Return>
): (...args: Args) => (callback: TEvent) => void {
  return (...args: Args) => (callback: Event<any>) => {
    let taskInstance = taskFor(taskProp).perform(...args);

    taskInstance.then(
      (data) => callback({ type: 'DONE', data }),
      (error) =>
        didCancel(error) ? callback({ type: 'CANCEL' }) : callback({ type: 'ERROR', error })
    );

    return () => taskInstance.cancel();
  };
}
