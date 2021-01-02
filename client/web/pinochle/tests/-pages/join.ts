import { assert } from '@ember/debug';
import { click, fillIn } from '@ember/test-helpers';

import { PageObject, selector } from 'fractal-page-object';

class NameEntryPage extends PageObject {
  typeName(name: string) {
    assert(`Field not found, cannot fill with text`, this._input.element);

    return fillIn(this._input.element, name);
  }

  submit() {
    assert(`Cannot click button that doesn't exist`, this._submit.element);

    return click(this._submit.element);
  }

  /*******************************************
   * @private
   *******************************************/
  _input = selector('[data-test-input]');
  _submit = selector('[data-test-submit]');
}

// https://github.com/bendemboski/fractal-page-object#in-ember
export class JoinPage extends PageObject {
  connecting = selector('[data-test-connecting]');
  joining = selector('[data-test-joining]');
  waiting = selector('[data-test-waiting]');
  gameNotFound = selector('[data-test-404]');
  starting = selector('[data-test-starting]');
  unknown = selector('[data-test-unknown]');

  typeName(name: string) {
    return this.nameEntry.typeName(name);
  }
  submitName() {
    return this.nameEntry.submit();
  }

  /*******************************************
   * @private~ish
   *******************************************/
  nameEntry = selector('[data-test-name-entry]', NameEntryPage);
}
