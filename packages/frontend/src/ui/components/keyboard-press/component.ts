import Component from '@ember/component';
import { EKMixin, keyDown } from 'ember-keyboard';

const KeyboardAwareComponent = Component.extend(EKMixin);

export default class KeyboardPress extends KeyboardAwareComponent {
  // key = null;
  // onPress = () => {};

  didInsertElement() {
    this._super(...arguments);

    this.set('keyboardActivated', true);

    this.on(keyDown(this.key), this.onPress);
  }
}
