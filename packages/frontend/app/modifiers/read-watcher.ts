import Modifier from 'ember-modifier';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

import { markAsRead } from 'emberclear/models/message/utils';

import Message from 'emberclear/models/message';
import { taskFor } from 'emberclear/utils/ember-concurrency';

interface Args {
  positional: [Message];
  named: {};
}

export default class ReadWatcher extends Modifier<Args> {
  io?: IntersectionObserver;
  message!: Message;

  didInstall() {
    let [message] = this.args.positional;

    this.message = message;
    this.maybeSetupReadWatcher();
  }

  // NOTE: this method should not exist, but does
  //       because vertical-collection recycles
  //       nodes
  didUpdateArguments() {
    this.willRemove();
    this.didInstall();
  }

  willRemove() {
    this.disconnect();
  }

  /**
   * if already read, this method happens to do nothing
   * */
  private disconnect() {
    if (this.element) {
      this.io?.unobserve(this.element);
      this.element.removeEventListener('click', this.markRead);
    }

    this.io?.disconnect();
    this.io = undefined;
  }

  // Needs the `this` bound, because of eventListener
  @action
  private markRead() {
    if (this.message.unread) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      taskFor(this.markReadTask).perform();
    }

    this.disconnect();
  }

  private maybeSetupReadWatcher() {
    if (this.message.readAt) return;

    this.setupIntersectionObserver();

    if (this.element) {
      this.element.addEventListener('click', this.markRead);
    }
  }

  private setupIntersectionObserver() {
    const io = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].intersectionRatio !== 0;
        const canBeSeen = !this.message.isSaving && document.hasFocus();

        if (isVisible && canBeSeen) {
          this.markRead();
        }
      },
      {
        root: document.querySelector('.messages'),
      }
    );

    if (this.element) {
      io.observe(this.element);
    }

    this.io = io;
  }

  @task({ withTestWaiter: true })
  *markReadTask() {
    let attempts = 0;
    while (attempts < 100) {
      attempts++;

      if (this.message.readAt) {
        return;
      }

      if (this.message.isSaving || !document.hasFocus()) {
        yield timeout(5);
      } else {
        yield markAsRead(this.message);
        return;
      }
    }
  }
}
