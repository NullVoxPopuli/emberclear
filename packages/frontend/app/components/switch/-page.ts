import { create, text, clickable, property } from 'ember-cli-page-object';

export const inputDefinition = {
  isChecked: property('checked'),
  check: clickable(),
};

export const definition = {
  scope: '.switch',

  label: text('label'),

  isChecked: property('checked', 'input'),
  check: clickable('input'),
};

export const page = create(definition);
