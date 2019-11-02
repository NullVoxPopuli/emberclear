/* eslint-env node */
'use strict';

// handled by ember-web-app
module.exports = function(environment /*, appConfig */) {
  // See https://github.com/san650/ember-web-app#documentation for a list of
  // supported properties

  // rootURL should end in a slash
  const rootURL = environment.rootURL || '/';

  return {
    name: 'emberclear',
    short_name: 'emberclear',
    description: 'Encrypted Chat. No History. No Logs.',
    start_url: `${rootURL}`,
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: `${rootURL}assets/images/icons/android-chrome-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `${rootURL}assets/images/icons/android-chrome-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    ms: {
      tileColor: '#fff',
    },
  };
};
