import EmberRouter from '@ember/routing/router';
import config from '../config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function() {
  this.route('chat');

  this.route('setup', function() {
    this.route('new');
    this.route('completed');
    this.route('overwrite');
  });

  this.route('contacts');
  this.route('login');
  this.route('logout');
  this.route('settings');
  this.route('faq');
});

export default Router;
