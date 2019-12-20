import { create, clickable } from 'ember-cli-page-object';

export const definition = {
  toggleMonero: clickable('[data-test-monero-toggle]'),
  moneroAddress: {
    scope: '[data-test-monero-address]',
  },
};

export const page = create(definition);
