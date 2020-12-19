import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { isSmallScreen, statechart } from './card-chart';

import type { Keyframes } from './card-chart';

export const SELECTED_TRANSFORM = {
  transform: `
    rotate(0deg)
    translate3d(-50%, -70%, 0)`,
};

export class CardAnimation {
  constructor(public element: HTMLElement, public frames: Keyframes) {}

  @use
  interpreter = new Statechart(() => {
    let { element, frames } = this;

    return {
      named: {
        chart: statechart,
        context: {
          element,
          keyframes: frames,
          previousFrames: frames,
          currentName: 'stack',
          previousName: 'stack',
          isSmallScreen: isSmallScreen(),
        },
        config: {
          actions: {},
        },
      },
    };
  });

  @action
  select() {
    this.interpreter.send('SELECT');
  }

  @action
  deselect() {
    this.interpreter.send('DESELECT');
  }

  @action
  toggle(delay: number) {
    this.interpreter.send('TOGGLE_FAN', { delay });
  }

  @action
  adjust(frames: Keyframes) {
    this.interpreter.send('ADJUST', { frames });
  }
}
