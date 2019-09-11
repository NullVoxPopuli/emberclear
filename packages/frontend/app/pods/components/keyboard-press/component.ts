import Component from '@ember/component';
import { EKMixin, keyDown, keyPress, keyUp, EKOnInsertMixin } from 'ember-keyboard';

const KeyboardAwareComponent = Component.extend(EKMixin, EKOnInsertMixin, {
  keyboardFirstResponder: true,
});

export default class KeyboardPress extends KeyboardAwareComponent {
  key!: string;
  onDown?: () => void;
  onPress?: () => void;
  onUp?: () => void;

  didInsertElement() {
    super.didInsertElement();

    const { key, onDown, onPress, onUp } = this;

    if (onDown) {
      this.on(keyDown(key), this.eventHandler(onDown));
    }

    if (onPress) {
      this.on(keyPress(key), this.eventHandler(onPress));
    }

    if (onUp) {
      this.on(keyUp(key), this.eventHandler(onUp));
    }
  }

  eventHandler(fn: () => void) {
    return (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      fn();
    };
  }
}
