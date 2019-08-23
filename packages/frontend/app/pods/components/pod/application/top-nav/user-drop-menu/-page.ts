import { create, text, clickable, hasClass } from 'ember-cli-page-object';

export const page = create({
  scope: '[data-test-top-nav] .right-nav [data-test-dropdown]',

  toggle: clickable('.dropdown-trigger'),

  isOpen: hasClass('active'),

  userName: text('section strong'),
  uid: text('section em'),

  logout: clickable('[data-test-logout]'),
});
