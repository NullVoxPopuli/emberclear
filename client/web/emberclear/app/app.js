import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import defineModifier from 'ember-concurrency-test-waiter/define-modifier';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

/*
 * This line is added to support initializers in the `app/` directory
 */
loadInitializers(App, config.modulePrefix);
// Ember.run.backburner.DEBUG = true;

defineModifier();
