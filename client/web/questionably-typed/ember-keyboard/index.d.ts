/* eslint-disable ember/no-new-mixins */
import Mixin from '@ember/object/mixin';

interface KeyboardMixin {
  on: (event: string, fn: () => void) => void;
}

export class EKMixin extends Mixin<KeyboardMixin> {}
export class EKOnInsertMixin extends Mixin<KeyboardMixin> {}
export function keyDown(key: string): string;
export function keyPress(key: string): string;
export function keyUp(key: string): string;
