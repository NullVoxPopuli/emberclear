import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type PlayerInfo from 'pinochle/services/player-info';

type Args = {
  onSubmit: (name: string) => void;
};

export default class NameEntry extends Component<Args> {
  @service declare playerInfo: PlayerInfo;

  get hasName() {
    return this.playerInfo.name.length > 0;
  }

  get isNameMissing() {
    return !this.hasName;
  }

  @action
  updateName(e: KeyboardEvent) {
    assert(`Expected event to be from an input field`, e.currentTarget instanceof HTMLInputElement);

    this.playerInfo.name = e.currentTarget.value;
  }

  @action
  submitName(e: Event) {
    e.preventDefault();

    if (!this.hasName) return;

    this.args.onSubmit(this.playerInfo.name);
  }
}
