import EmberRouter from "@ember/routing/router";
import config from "../config/environment";

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('setup', function() {
    this.route('introduction');
    this.route('confirm-identity');
    this.route('finished');
  });

  this.route('login');
  this.route('chat');
  this.route('settings');
  this.route('faq');
});

export default Router;
