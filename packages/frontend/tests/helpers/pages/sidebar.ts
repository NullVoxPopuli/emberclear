import { find, click } from '@ember/test-helpers';

const wrapper = '[data-test-offcanvas-wrapper]';
const toggleButton = '[data-test-hamburger-toggle]';
const sidebarContainer = '[data-test-sidebar-container]';

export const sidebar = {
  wrapper: () => find(wrapper),

  toggle: () => click(`${wrapper} ${sidebarContainer} > ${toggleButton}`),

  isOpen: () => !!find(`${wrapper} .is-sidebar-visible`),
  isPresent: () => !!find(`${wrapper} ${sidebarContainer}`),
}

export default {
  sidebar
}
