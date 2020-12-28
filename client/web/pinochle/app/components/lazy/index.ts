import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { later, run } from '@ember/runloop';

type Args = {
  wait: number;
  when: boolean;
};

export default class LazyComponent extends Component<Args> {
  @tracked isShowing = false;

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    run('afterRender', () => {
      later(this, 'toggleContent', args.wait);
    });
  }

  toggleContent() {
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    if (this.args.when) {
      this.isShowing = !this.isShowing;
    }
  }
}
