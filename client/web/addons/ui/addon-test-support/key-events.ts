import { triggerKeyEvent } from '@ember/test-helpers';

import type { KeyModifiers } from '@ember/test-helpers/dom/trigger-key-event';

export async function keyPressFor(
  selector: string | Element,
  key: string | number,
  modifiers?: KeyModifiers
) {
  await triggerKeyEvent(selector, 'keydown', key, modifiers);
  await triggerKeyEvent(selector, 'keyup', key, modifiers);
  await triggerKeyEvent(selector, 'keypress', key, modifiers);
}

export function keyEvents(selector: string) {
  return {
    pressEscape() {
      return keyPressFor(selector, 'Escape');
    },
    pressEnter() {
      return keyPressFor(selector, 'Enter');
    },
    pressTab() {
      return keyPressFor(selector, 'Tab');
    },
    pressUp() {
      return keyPressFor(selector, 'ArrowUp');
    },
    pressDown() {
      return keyPressFor(selector, 'ArrowDown');
    },
    pressLeft() {
      return keyPressFor(selector, 'ArrowLeft');
    },
    pressRight() {
      return keyPressFor(selector, 'ArrowRight');
    },
  };
}
