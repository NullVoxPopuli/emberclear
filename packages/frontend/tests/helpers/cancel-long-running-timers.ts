import { run, cancel, later } from '@ember/runloop';

export function cancelLongRunningTimers(hooks: NestedHooks) {
  hooks.beforeEach(function() {
    if (window._breakTimerLoopsId) {
      run.cancelTimers();
      cancel(window._breakTimerLoopsId);
    }

    window._breakTimerLoopsId = later(() => {
      run.cancelTimers();
    }, 500);
  });

  hooks.afterEach(function() {
    cancel(window._breakTimerLoopsId);
  });
}