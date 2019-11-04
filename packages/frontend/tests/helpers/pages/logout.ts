import { create, clickable } from 'ember-cli-page-object';

export const page = create({
  confirmLogout: clickable('[data-test-confirm-logout]'),
});
