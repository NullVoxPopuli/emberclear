/* eslint-disable @typescript-eslint/ban-types */
import { isDestroyed as _isDestroyed, isDestroying as _isDestroying } from '@ember/destroyable';

/**
 * Wraps isDestroyed and isDestroying under one function
 * because for 99% of the time, we don't care about the difference.
 */
export function isDestroyed(context: object) {
  return _isDestroyed(context) || _isDestroying(context);
}
