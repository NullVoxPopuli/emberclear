import { waitUntil, click } from '@ember/test-helpers';

/*
 * This is a special page object, because it
 * lives outside the ember-app.
 *
 */
const selector = '.toastify';

function findToast(): Element {
  let toast = document.querySelector(selector);

  if (!toast) throw new Error('Toast not found');

  return toast;
}

export const toast = {
  get isVisible() {
    return findToast();
  },
  get text() {
    return findToast().textContent;
  },

  dismiss() {
    return click(findToast());
  },
  waitForToast() {
    return waitUntil(() => document.querySelector(selector), { timeout: 300 });
  },
};
