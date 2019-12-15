import Application from '@ember/application';
import Resolver from 'ember-resolver';
import config from './config/environment';

import defineModifier from 'ember-concurrency-test-waiter/define-modifier';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

defineModifier();
