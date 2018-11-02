import Resolver from 'ember-resolver/resolvers/fallback';
// import Resolver from 'ember-resolver/resolvers/glimmer-wrapper';

import buildResolverConfig from 'ember-resolver/ember-config';
import config from '../config/environment';

let moduleConfig = buildResolverConfig(config.modulePrefix);
/*
 * If your application has custom types and collections, modify moduleConfig here
 * to add support for them.
 */

moduleConfig.types = Object.assign(moduleConfig.types, {
  config: { definitiveCollection: 'main' },
  util: { definitiveCollection: 'utils' },
  'component-manager': { definitiveCollection: 'main' },
  // ember-intl
  'ember-intl@adapter': { definitiveCollection: 'main' },
  'ember-intl@translation': { definitiveCollection: 'main' },
  translation: { definitiveCollection: 'main' },
  formats: { definitiveCollection: 'main' },
  cldr: { definitiveCollection: 'main' },
  'util:intl': { definitiveCollection: 'utils' },
  // ember-gestures
  'ember-gesture': { definitiveCollection: 'main' }
});

moduleConfig.collections.main.types.push('config');
moduleConfig.collections.main.types.push('translation');

export default Resolver.extend({
  config: moduleConfig,
});
