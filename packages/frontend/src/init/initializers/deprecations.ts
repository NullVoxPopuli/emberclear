import { registerDeprecationHandler } from '@ember/debug';

import config from 'emberclear/config/environment';

export function initialize() {
  if (typeof registerDeprecationHandler === 'function') {
    registerDeprecationHandler((_message, _options, next) => {
      if (config.environment === 'test') {
        return;
      }

      next();
    });
  }
}

export default { initialize };
