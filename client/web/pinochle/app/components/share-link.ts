import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';

type Args = {
  url: string;
};

export default class ShareLink extends Component<Args> {
  @action
  copy() {
    let url = this.args.url;

    navigator.clipboard.writeText(url);
  }

  @action
  highlight(event: MouseEvent) {
    assert(`event expected to come from an iput element`, event.target instanceof HTMLInputElement);

    event.target.select();
  }
}
