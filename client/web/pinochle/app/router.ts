import EmberRouter from '@ember/routing/router';

import config from 'pinochle/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('host');
  this.route('join', { path: 'join/:idOfHost/' });
  this.route('game', { path: 'game/:idOfHost/' });
});
