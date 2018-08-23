import { registerDeprecationHandler } from '@ember/debug';

import config from 'emberclear/config/environment';

export function initialize() {
  if (typeof registerDeprecationHandler === 'function') {
    registerDeprecationHandler((message, options, next) => {
      if (config.environment === 'test')  {
        return;
      }

      next(message, options);
    });
  }
}

export default { initialize };
