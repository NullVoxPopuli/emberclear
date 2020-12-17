import { assert } from '@ember/debug';

import {
  fannedKeyframes,
  flatKeyframes,
  getPoints,
  stackedKeyframes,
} from './-animation/key-frames';

import type { CardAnimation } from './-animation/card';
import type { Card } from 'pinochle/utils/deck';

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

    existing.adjust({ stack, flat, fan });
  }
}
