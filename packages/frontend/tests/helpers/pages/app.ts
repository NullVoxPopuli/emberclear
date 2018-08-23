import { find, click } from '@ember/test-helpers';

const toast = '[data-test-notification-message]';

export const app = {
  toast: () => find(toast),
  dismissToast: () => click(toast),
}

export default {
  app
}
