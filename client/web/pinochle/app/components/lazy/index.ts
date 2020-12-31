import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { later, run } from '@ember/runloop';

type Args = {
  wait: number;
  when: boolean;
};

export default class LazyComponent extends Component<Args> {
  @tracked _isShowing = false;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    run('afterRender', () => {
      later(this, 'toggleContent', args.wait);
    });
  }

  get isShowing() {
    return this._isShowing && this.cond;
  }

  get cond() {
    return this.args.when || !('when' in this.args);
  }

  toggleContent() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    this._isShowing = !this._isShowing;
  }
}
