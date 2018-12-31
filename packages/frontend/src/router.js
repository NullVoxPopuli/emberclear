import EmberRouter from '@ember/routing/router';
import RouterScroll from 'ember-router-scroll';
import config from '../config/environment';

const Router = EmberRouter.extend(RouterScroll, {
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('chat', function() {
    this.route('privately-with', { path: '/privately-with/:u_id' });
    this.route('in-channel', { path: '/in-channel/:channel_id' });
  });

  this.route('setup', function() {
    this.route('new');
    this.route('completed');
    this.route('overwrite');
  });

  this.route('contacts');
  this.route('login');
  this.route('invite');
  this.route('logout');
  this.route('settings', function() {
    this.route('interface');
    this.route('permissions');
    this.route('relays');
    this.route('danger-zone');
  });
  this.route('faq');
});

export default Router;
