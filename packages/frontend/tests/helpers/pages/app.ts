import { find, click, waitFor } from '@ember/test-helpers';

const toast = '[data-test-notification-message]';

export const app = {
  toast: () => find(toast),
  toastText: () => find(toast)!.textContent,
  dismissToast: () => click(toast),
  waitForToast: () => waitFor(toast, { timeout: 100 }),

  userDropdown: {
    open: () => click('[data-test-user-dropdown-toggle]'),
    clickLogout: () => click('[data-test-user-dropdown] [data-test-logout]'),
    logoutButton: () => find('[data-test-user-dropdown] [data-test-logout]')
  }
}

export default {
  app
}
