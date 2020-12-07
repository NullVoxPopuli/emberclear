const ENV = {};

ENV['fontawesome'] = {
  defaultPrefix: 'fas', // free-and-solid
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
