// install types
import '@emberclear/networking/type-support';
// have to import files that aren't imported elsewhere
// these should be periodically checked to see if they can be removed
import 'emberclear/services/redirect-manager';
import 'emberclear/services/chat-scroller';

import Application from '@ember/application';

import defineModifier from 'ember-concurrency-test-waiter/define-modifier';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';

import config from 'emberclear/config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

/*
 * This line is added to support initializers in the `app/` directory
 */
loadInitializers(App, config.modulePrefix);

defineModifier();
