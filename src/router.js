import EmberRouter from "@ember/routing/router";
import config from "../config/environment";

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('setup');
  this.route('login');
  this.route('chat');
  this.route('settings');
  this.route('faq');
});

export default Router;
