import { assert } from '@ember/debug';
import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { CardAnimation, SELECTED_TRANSFORM } from './card';
import { statechart } from './hand-chart';
import { fannedKeyframes, flatKeyframes, getPoints, stackedKeyframes } from './key-frames';

import type { Context, Event, Schema, SelectEvent } from './hand-chart';
import type { Card } from 'pinochle/utils/deck';

function getAnimations(points: ReturnType<typeof getPoints>, cards: Card[]) {
  let result = new WeakMap<Card, CardAnimation>();
  let stackedFrames = stackedKeyframes(points);
  let fannedFrames = fannedKeyframes(points);
  let flatFrames = flatKeyframes(points);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const stackFrame = stackedFrames[i];
    const fanFrame = fannedFrames[i];
    const flatFrame = flatFrames[i];
    const element = document.getElementById(card.id);

    assert(`Expected element to exist`, element && element instanceof HTMLElement);

    result.set(
      card,
      new CardAnimation(element, {
        stack: stackFrame,
        flat: flatFrame,
        fan: fanFrame,
        selected: SELECTED_TRANSFORM,
      })
    );
  }

  return result;
}

type ToggleOptions = {
  cards: Card[];
  animations: WeakMap<Card, CardAnimation>;
};

export function adjustHand({ cards, animations }: ToggleOptions) {
  let points = getPoints(cards.length);

  let stackedFrames = stackedKeyframes(points);
  let flatFrames = flatKeyframes(points);
  let fannedFrames = fannedKeyframes(points);

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const existing = animations.get(card);

    if (!existing) {
      continue; // not-possible? maybe?
    }

    let stack = stackedFrames[i];
    let flat = flatFrames[i];
    let fan = fannedFrames[i];

    existing.adjust({ stack, flat, fan, selected: SELECTED_TRANSFORM });
  }
}

export class HandAnimation {
  constructor(_owner: unknown, public cards: Card[]) {}

  @use
  interpreter = new Statechart(() => {
    return {
      named: {
        chart: statechart,
        context: this.context,
        config: {
          actions: {
            closeHand: this._closeHand,
            fanOpen: this._fanOpen,
            adjustHand: this._adjustHand,
            returnSelectedToHand: this._returnSelected,
            showSelected: this._showSelected,
          },
          guards: {},
        },
      },
    };
  });

  @action
  toggle() {
    this.interpreter.send('TOGGLE_FAN');
  }

  @action
  send(...args: Parameters<Statechart<Context, Schema, Event>['send']>) {
    this.interpreter.send(...args);
  }

  /**
   * Private
   */
  get context() {
    let points = getPoints(this.cards.length);

    return {
      isOpen: false,
      cards: this.cards,
      points,
      animations: getAnimations(points, this.cards),
    };
  }

  // Actions used to tell the cards' machines what to do
  @action
  _fanOpen({ cards, animations }: Context) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      let existing = animations.get(card);

      assert(
        `something went wrong at position ${i} retrieving the animation for ${card}`,
        existing
      );

      existing.toggle(i * 10);
    }
  }

  @action
  _closeHand(context: Context) {
    // secretly a toggle
    this._fanOpen(context);
  }

  @action
  _adjustHand({ cards, animations }: Context) {
    return adjustHand({ cards, animations });
  }

  @action
  _showSelected({ animations, cards }: Context, { card }: SelectEvent) {
    for (let current of cards) {
      let existing = animations.get(current);

      assert(`something went wrong retrieving the animation for ${card}`, existing);

      if (current === card) {
        existing.select();
        continue;
      }

      existing.deselect();
    }
  }

  @action
  _returnSelected({ animations, selected }: Context) {
    assert(`can't return unselected card`, selected);

    let existing = animations.get(selected);

    assert(`something went wrong retrieving the animation for ${selected}`, existing);

    existing.select();
  }
}
