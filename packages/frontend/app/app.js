import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

import defineModifier from 'ember-concurrency-test-waiter/define-modifier';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

Sentry.init({
  dsn: 'https://cf1cbf0969314ecfb5fee114482fccbe@sentry.io/1422271',
  integrations: [new Integrations.Ember()],
});

/*
 * This line is added to support initializers in the `app/` directory
 */
loadInitializers(App, config.modulePrefix);

defineModifier();
