import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';

import { TrackedArray } from 'tracked-built-ins';

import { getPoints } from 'pinochle/utils/animation/hand';
import { radiansToDegrees } from 'pinochle/utils/trig';

import type { Card, Hand } from 'pinochle/utils/deck';

type Args = {
  hand: Hand;
};

const animations = new WeakMap<HTMLElement, Animation>();

export default class HandComponent extends Component<Args> {
  @tracked isActive = false;

  @cached
  get animationPathMeta() {
    return getPoints(this.cards.length);
  }

  @action
  toggle(e: MouseEvent) {
    this.isActive = !this.isActive;
    assert(`expected to be an HTML Element`, e.currentTarget instanceof HTMLElement);

    toggleHand({
      parentElement: e.currentTarget,
      isOpen: this.isActive,
      keyframes: this.keyframes,
    });
  }

  @action
  remove(card: Card) {
    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i] === card) {
        this.cards.splice(i, 1);
        break;
      }
    }
  }

  // @cached
  get keyframes() {
    let { path, positions } = this.animationPathMeta;

    return positions.map((position, i) => {
      return [
        {
          transform: `translate3d(${0 - 0.5 * i}%, ${0 - 0.5 * i}%, 0)`,
          transformOrigin: `50% ${path.y}px`,
        },
        {
          transform: `
            rotate(${radiansToDegrees(position.rad)}deg)
            translate3d(${0 - 0.5 * i}%, ${0 - 0.5 * i}%, 0)
          `,
          transformOrigin: `50% ${path.y / 2}px`,
        },
      ];
    });
  }

  cards = new TrackedArray<Card>([
    { suit: 'hearts', value: 10 },
    { suit: 'spades', value: 9 },
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
  ]);
}

type ToggleOptions = {
  parentElement: HTMLElement;
  isOpen: boolean;
  keyframes: typeof HandComponent['keyframes'];
};

function toggleHand({ parentElement, isOpen, keyframes }: ToggleOptions) {
  let cards = parentElement.querySelectorAll('.playing-card');

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    assert(`expected to be an html element`, card instanceof HTMLElement);

    const existing = animations.get(card);

    if (existing) {
      existing.pause();
      existing.reverse();
      existing.play();
      continue;
    }

    let animationOptions: KeyframeAnimationOptions = {
      duration: 500,
      iterations: 1,
      fill: 'both',
      delay: i * 7,
    };

    if (!isOpen) {
      animationOptions.direction = 'reverse';
    }

    let animation = card.animate(keyframes[i], animationOptions);

    animations.set(card, animation);
    animation.onfinish = () => animations.delete(card);
  }
}
