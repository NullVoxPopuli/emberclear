import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';

import { circleFromThreePoints, radiansToDegrees } from 'pinochle/utils/trig';

import type { Hand } from 'pinochle/utils/deck';

type Args = {
  hand: Hand;
};

const animations = new WeakMap<HTMLElement, Animation>();

export default class HandComponent extends Component<Args> {
  @tracked isActive = false;

  // @cached
  get keyframes() {
    let { path, positions } = getPoints(this.cards.length);

    return positions.map((position, i) => {
      return [
        // {
        //   transform: `translate3d(-${50 - 0.5 * i}%, -${10 - 0.5 * i}%, 0)`,
        // },
        {
          transform: `rotate(${radiansToDegrees(position.rad)}deg)`,
          // transformOrigin: `${path.x}px ${path.y}px`,
          transformOrigin: `50% ${path.y}px`,
        },
      ];
    });
  }

  @action
  toggle(e: MouseEvent) {
    this.isActive = !this.isActive;
    assert(`expected to be an HTML Element`, e.currentTarget instanceof HTMLElement);

    let cards = e.currentTarget.querySelectorAll('.playing-card');

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      assert(`expected to be an HTML Element`, card instanceof HTMLElement);

      const existing = animations.get(card);

      if (existing) {
        existing.reverse();
        animations.delete(card);
        continue;
      }

      let animationOptions: KeyframeAnimationOptions = {
        duration: 500,
        iterations: 1,
        fill: 'both',
      };

      if (!this.isActive) {
        animationOptions.direction = 'reverse';
      }

      let animation = card.animate(this.keyframes[i], animationOptions);

      animations.set(card, animation);
      animation.onfinish = () => animations.delete(card);
    }
  }

  get cards() {
    return [
      { suit: 'hearts', value: 10 },
      { suit: 'spaces', value: 9 },
      { suit: 'diamonds', value: 8 },
      { suit: 'diamonds', value: 7 },
      { suit: 'diamonds', value: 6 },
      { suit: 'diamonds', value: 5 },
      { suit: 'clubs', value: 10 },
      { suit: 'clubs', value: 9 },
      { suit: 'clubs', value: 8 },
      { suit: 'clubs', value: 7 },
      { suit: 'clubs', value: 6 },
      { suit: 'clubs', value: 5 },
      { suit: 'clubs', value: 5 },
    ];
  }
}

/**
 *
 * Returns points along the arc of a circle clipped by the viewport where
 * the outside points have a reasonable amount of padding from the window
 * edge
 *
 * The circle is initally defined by 3 points:
 *  - midpoint along X + some percent height for Y / top of the circle
 *  - bottom-left corner
 *  - bottom-right corner
 *
 * NOTES:
 *   rad = Math.atan2(y - cy, x - cx)
 *
 *   when a is radians:
 *     x = cx + r * cos(a)
 *     y = cy + r * sin(a)
 *
 * It's been a long while since I've done trig. :D
 */
function getPoints(num: number) {
  let viewportWidth = window.innerWidth;
  let left = 0;
  let right = viewportWidth;
  let bottom = window.innerHeight;

  let { x: circleX, y: circleY, r: circleRadius } = circleFromThreePoints(
    { x: left, y: bottom + 200 },
    { x: viewportWidth / 2, y: bottom * 0.9 },
    { x: right, y: bottom + 200 }
  );

  // given the bottom of the window as an "ok" Y, find the two X values for the circle at that Y
  let leftAngle = Math.atan2(bottom - circleY, left - circleX);
  let rightAngle = Math.atan2(bottom - circleY, right - circleX);

  console.log({ circleX, circleY, circleRadius });
  console.log(radiansToDegrees(leftAngle), radiansToDegrees(rightAngle));
  // divide the angle by num + 2 to account for some padding
  let totalAngle = rightAngle - leftAngle; // leftAngle - rightAngle;
  let arcWidth = totalAngle / (num + 6);

  let positions = Array(num)
    .fill(undefined)
    .map((_, i) => {
      // let angle = rightAngle + i * arcWidth;

      return {
        // x: circleX + circleRadius * Math.cos(angle),
        // y: circleY + circleRadius + Math.sin(angle),
        // rad: rightAngle - (i * arcWidth),
        rad: ((i - num / 2) * arcWidth),
      };
    });

  return {
    path: {
      x: circleY,
      y: circleY,
      radius: circleRadius,
    },
    positions,
  };
}
