import Resolver from 'ember-resolver/resolvers/fallback';
// import Resolver from 'ember-resolver/resolvers/glimmer-wrapper';

import buildResolverConfig from 'ember-resolver/ember-config';
import config from '../config/environment';

let moduleConfig = buildResolverConfig(config.modulePrefix);
/*
 * If your application has custom types and collections, modify moduleConfig here
 * to add support for them.
 */

//////////////
// ember-intl
moduleConfig.types = Object.assign(moduleConfig.types, {
  'ember-intl@adapter': { definitiveCollection: 'main' },
  'ember-intl@translation': { definitiveCollection: 'main' },
  translation: { definitiveCollection: 'main' },
  formats: { definitiveCollection: 'main' },
  cldr: { definitiveCollection: 'main' },
  util: { definitiveCollection: 'main' },
});
moduleConfig.collections.main.types.push('translation');

//////////////////
// ember-gestures
moduleConfig.types = Object.assign(moduleConfig.types, {
  'ember-gesture': { definitiveCollection: 'main' },
});

//////////////////////////
// ember-inspector support
moduleConfig.types = Object.assign(moduleConfig.types, {
  'data-adapter': { definitiveCollection: 'data' },
  'container-debug-adapter': { definitiveCollection: 'data' },
  'resolver-for-debugging': { definitiveCollection: 'data' },
});

moduleConfig.collections.main.types.push('data');

moduleConfig.collections = Object.assign(moduleConfig.collections, {
  data: {
    types: ['data-adapter', 'model'],
    defaultType: 'model',
  },
});

export default Resolver.extend({
  config: moduleConfig,
});
