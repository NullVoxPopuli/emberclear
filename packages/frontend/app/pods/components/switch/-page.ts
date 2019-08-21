import { create, text, clickable, property } from 'ember-cli-page-object';

export const page = create({
  scope: '.switch',

  label: text('label'),

  isChecked: property('checked', 'input'),
  check: clickable('input'),
});
