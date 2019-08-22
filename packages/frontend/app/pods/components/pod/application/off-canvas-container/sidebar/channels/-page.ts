import { triggerKeyEvent } from '@ember/test-helpers';
import { create, fillable, clickable } from 'ember-cli-page-object';

const channelForm = '[data-test-channel-form]';

export const sidebarChannelsPage = create({
  toggleForm: clickable('[data-test-channel-form-toggle]'),
  form: {
    scope: channelForm,
    fill: fillable('input'),
    submit: () => triggerKeyEvent(`${channelForm} input`, 'keypress', 'Enter'),
  },
});
