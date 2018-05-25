import { helper } from '@ember/component/helper';
import { getOwner } from '@ember/application';

export function routeMatches(params/*, hash*/) {
  const owner = getOwner(this);
  const router = owner.lookup('router:main');

  console.log(router.location, params);
  const desiredRoute = params[0];
  return router.location === desiredRoute;
}

export default helper(routeMatches);
