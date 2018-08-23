// Taken from https://gist.github.com/chriskrycho/9ed39076ccb698023e57e59080fedecd
import ComputedProperty from '@ember/object/computed';
import RSVP from 'rsvp';

export enum TaskInstanceState {
    Dropped = 'dropped',
    Canceled = 'canceled',
    Finished = 'finished',
    Running = 'running',
    Waiting = 'waiting',
}

export interface TaskProperty<T> extends ComputedProperty<T> {
    cancelOn(eventNames: string[]): this;
    debug(): this;
    drop(): this;
    enqueue(): this;
    group(groupPath: string): this;
    keepLatest(): this;
    maxConcurrency(n: number): this;
    on(eventNames: string[]): this;
    restartable(): this;
}

export interface TaskInstance<T> extends PromiseLike<T> {
    readonly error?: any;
    readonly hasStarted: ComputedProperty<boolean>;
    readonly isCanceled: ComputedProperty<boolean>;
    readonly isDropped: ComputedProperty<boolean>;
    readonly isError: boolean;
    readonly isFinished: ComputedProperty<boolean>;
    readonly isRunning: ComputedProperty<boolean>;
    readonly isSuccessful: boolean;
    readonly state: ComputedProperty<TaskInstanceState>;
    readonly value?: T;
    cancel(): void;
    catch(): RSVP.Promise<any>;
    finally(): RSVP.Promise<any>;
    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | RSVP.Promise<TResult1>) | undefined | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): RSVP.Promise<TResult1 | TResult2>;
}

export enum TaskState {
    Running = 'running',
    Queued = 'queued',
    Idle = 'idle',
}

interface Task<T, P> extends TaskProperty<T> {
    readonly isIdle: boolean;
    readonly isQueued: boolean;
    readonly isRunning: boolean;
    readonly last?: TaskInstance<T>;
    readonly lastCanceled?: TaskInstance<T>;
    readonly lastComplete?: TaskInstance<T>;
    readonly lastErrored?: TaskInstance<T>;
    readonly lastIncomplete?: TaskInstance<T>;
    readonly lastPerformed?: TaskInstance<T>;
    readonly lastRunning?: TaskInstance<T>;
    readonly lastSuccessful?: TaskInstance<T>;
    readonly performCount: number;
    readonly state: TaskState;
    perform(...args: any[]);
    cancelAll(): void;
}

export function allSettled(promiseLikeObjects: any[]): Promise<any>;
export function task(generator: any): Task;
export function waitForProperty(object: object, key: string, callbackOrValue?: any): Promise<any>;
export function waitForQueue(queue: string): Promise<any>;
export function timeout(seconds: number): Promise<any>;
export function all(promises: any[]): Promise<any>;
