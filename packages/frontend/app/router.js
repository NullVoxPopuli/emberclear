import EmberRouterScroll from 'ember-router-scroll';
import config from 'emberclear/config/environment';

class Router extends EmberRouterScroll {
  location = config.locationType;
  rootURL = config.rootURl;
}

Router.map(function () {
  this.route('chat', function () {
    this.route('privately-with', { path: '/privately-with/:u_id' });
    this.route('in-channel', { path: '/in-channel/:id' });
  });

  this.route('setup');

  this.route('contacts');
  this.route('login');
  this.route('invite');
  this.route('logout');
  this.route('settings', function () {
    this.route('interface');
    this.route('relays');
    this.route('danger-zone');
  });
  this.route('faq');

  this.route('add-friend');
  this.route('donate');

  this.route('not-found', { path: '/*path' });
});

export default Router;
