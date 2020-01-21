import EmberRouter from '@ember/routing/router';
import RouterScroll from 'ember-router-scroll';
import config from 'emberclear/config/environment';

const Router = EmberRouter.extend(RouterScroll, {
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('chat', function() {
    this.route('privately-with', { path: '/privately-with/:u_id' });
    this.route('in-channel', { path: '/in-channel/:id' });
  });

  this.route('setup', function() {
    this.route('new');
    this.route('completed');
    this.route('overwrite');
  });

  this.route('contacts');

  this.route('login', function() {
    this.route('import');
  });

  this.route('invite');
  this.route('logout');
  this.route('settings', function() {
    this.route('interface');
    this.route('relays');
    this.route('danger-zone');

    this.route('transfer');
  });
  this.route('faq');

  this.route('not-found', { path: '/*path' });
  this.route('add-friend');
  this.route('donate');
});

export default Router;
