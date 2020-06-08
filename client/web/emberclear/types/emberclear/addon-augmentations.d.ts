import { TaskProperty } from 'ember-concurrency';

declare module 'ember-concurrency' {
  interface TaskProperty<T, Args extends any[]> {
    withTestWaiter(): this;
  }
}

import '@ember/component';

declare module '@ember/component' {
  export const setComponentTemplate: any;
}
