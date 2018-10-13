import { find, click, triggerKeyEvent, fillIn } from '@ember/test-helpers';

const wrapper = '[data-test-offcanvas-wrapper]';
const toggleButton = '[data-test-hamburger-toggle]';
const sidebarContainer = '[data-test-sidebar-container]';
const channelForm = '[data-test-channel-form]';

export const sidebar = {
  wrapper: () => find(wrapper),

  toggle: () => click(`${wrapper} ${sidebarContainer} > ${toggleButton}`),

  isOpen: () => !!find(`${wrapper} .is-sidebar-visible`),
  isPresent: () => !!find(`${wrapper} ${sidebarContainer}`),


  channels: {
    toggleForm: () => click('[data-test-channel-form-toggle]'),
    form: () => find(channelForm),
    formInput: () => find(`${channelForm} input`),
    fillInput: (text: string) => fillIn(`${channelForm} input`, text),
    submitForm: () => triggerKeyEvent(`${channelForm} input`, 'keypress', 'Enter')
  }

};

export default {
  sidebar
};
