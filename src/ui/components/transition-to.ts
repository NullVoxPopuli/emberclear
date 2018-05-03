import { getOwner } from '@ember/application';
import Helper from '@ember/component/helper';
import { assert } from '@ember/debug';
import { computed } from '@ember/object';

function transformQueryParams(transitionArgs) {
  return (!transitionArgs || typeof transitionArgs.map !== 'function') ? transitionArgs :
    transitionArgs.map((arg) => {
    if (arg && arg.isQueryParams) {
      return { queryParams: arg.values };
    } else {
      return arg;
    }
  });
}

export const helper = Helper.extend({
  router: computed(function() {
    return getOwner(this).lookup('router:main');
  }).readOnly(),

  compute([routeName, ...params]) {
    const router = this.get('router');
    assert('[ember-transition-helper] Unable to lookup router', router);
    return function(...invocationArgs) {
      const args = params.concat(invocationArgs);
      const transitionArgs = params.length ? [routeName, ...params] : [routeName];
      router.transitionTo(...transformQueryParams(transitionArgs));
      return args;
    };
  }
});
