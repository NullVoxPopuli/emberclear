const ENV = {};

ENV['routerScroll'] = {
  scrollElement: '#scrollContainer',
};

ENV['fontawesome'] = {
  defaultPrefix: 'fas', // free-and-solid
  icons: {
    'free-brands-svg-icons': ['reddit', 'twitter', 'monero'],
    'free-solid-svg-icons': [
      'qrcode',
      'user-circle',
      'address-book',
      'sliders-h',
      'sign-out-alt',
      'dot-circle',
      'plus',
      'code',
      'desktop',
      'bed',
      'video',
      'angle-down',
      'angle-up',
      'angle-right',
      'times',
      'times-circle',
      'phone',
      'phone-volume',
      'share',
      'check-circle',
      'exclamation-circle',
      'check',
      'ellipsis-h',
      'globe',
      'bars',
      'search',
      'thumbtack',
      'minus',
    ],
  },
};

ENV['ember-a11y-testing'] = {
  componentOptions: {
    turnAuditOff: true,
  },
};

ENV['ember-component-css'] = {
  namespacing: false,
};

ENV['ember-cli-notifications'] = {
  icons: 'fa-5',
};

ENV['ember-service-worker-update-notify'] = {
  pollingInterval: 120000, // two minutes
};

module.exports = ENV;
