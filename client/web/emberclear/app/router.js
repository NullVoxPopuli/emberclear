import Ember from 'ember';
import EmberRouter from '@ember/routing/router';
import config from 'emberclear/config/environment';

class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;

  constructor() {
    super(...arguments);

    this.on('routeDidChange', () => {
      // window would normally be used for scrolling, but that doesn't work
      // for testing...
      if (Ember.testing) {
        document.querySelector('.ember-application').scrollTo(0, 0);
      } else {
        window.scrollTo(0, 0);
      }
    });
  }
}

Router.map(function () {
  this.route('chat', function () {
    this.route('privately-with', { path: '/privately-with/:id' });
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
  this.route('qr');
});

export default Router;
