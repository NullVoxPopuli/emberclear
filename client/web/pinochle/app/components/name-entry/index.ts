import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';

import { inLocalStorage } from 'ember-tracked-local-storage';

type Args = {
  onSubmit: (name: string) => void;
};

export default class NameEntry extends Component<Args> {
  @inLocalStorage name = '';

  get hasName() {
    return this.name.length > 0;
  }

  get isNameMissing() {
    return !this.hasName;
  }

  @action
  updateName(e: KeyboardEvent) {
    assert(`Expected event to be from an input field`, e.currentTarget instanceof HTMLInputElement);

    this.name = e.currentTarget.value;
  }

  @action
  submitName(e: Event) {
    e.preventDefault();

    if (!this.hasName) return;

    this.args.onSubmit(this.name);
  }
}
