import { assert } from '@ember/debug';

/**
 * TODO: write babel plugin that removes these from the build during production build
 */

export function isHTMLElement(
  element: null | undefined | Element | EventTarget
): asserts element is HTMLElement {
  return assert(`expected ${element} to be an HTML Element`, element);
}
