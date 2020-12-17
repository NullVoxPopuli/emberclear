import { assert } from '@ember/debug';

import { assign, send } from 'xstate';
import { choose } from 'xstate/lib/actions';

import type { Card } from 'pinochle/utils/deck';
import type { MachineConfig, StateSchema } from 'xstate';

export type Keyframes = {
  fan: Keyframe;
  flat: Keyframe;
  stack: Keyframe;
  selected: Keyframe;
};

export type Context = {
  // card: Card;
  element: HTMLElement;
  animation?: Animation;
  keyframes: Keyframes;
  isSmallScreen: boolean;

  // Temp state for animating
  previousFrames: Keyframes;
  delay?: number;
  currentName: keyof Keyframes;
  previousName: keyof Keyframes;
  current?: Keyframe;
  next?: Keyframe;
};

type AdjustEvent = {
  type: 'ADJUST';
  frames: Keyframes;
};

type ToggleEvent = {
  type: 'TOGGLE_FAN';
  delay: number;
};

export type Event =
  | { type: 'SELECT' }
  | { type: 'DESELECT' }
  | { type: 'FAN' }
  | { type: 'STACK' }
  | { type: 'FLAT' }
  | { type: 'ANIMATE_ADJUSTMENT' }
  | ToggleEvent
  | AdjustEvent;

export interface Schema extends StateSchema<Context> {
  states: {
    fanned: StateSchema<Context>;
    stacked: StateSchema<Context>;
    flat: StateSchema<Context>;
    selected: StateSchema<Context>;
  };
}

const SMALL_SCREEN = 1000;
const ANIMATION_DURATION = 250;
const DEFAULT_ANIMATION_OPTIONS: KeyframeAnimationOptions = {
  duration: ANIMATION_DURATION,
  iterations: 1,
  fill: 'both',
};

function isBigScreen() {
  return window.innerWidth >= SMALL_SCREEN;
}

export function isSmallScreen() {
  return !isBigScreen();
}

function animate(
  context: Context,
  current: Keyframe | null,
  next: Keyframe,
  options: KeyframeAnimationOptions = {}
) {
  if (context.animation) {
    context.animation.cancel();
  }

  // filter does not narrow type
  let frames = [current, next].filter(Boolean) as Keyframe[];

  return context.element.animate(frames, {
    ...DEFAULT_ANIMATION_OPTIONS,
    delay: context.delay,
    ...options,
  });
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'card-chart',
  initial: 'stacked',
  on: {
    ADJUST: {
      actions: [
        assign<Context>({
          previousFrames: (ctx) => ctx.keyframes,
          keyframes: (_: Context, { frames }: AdjustEvent) => frames,
          isSmallScreen: () => isSmallScreen(),
        }),
        send('ANIMATE_ADJUSTMENT'),
      ],
    },
  },
  states: {
    fanned: {
      entry: [
        assign<Context>({
          currentName: 'fan',
          animation: (ctx: Context) => {
            return animate(ctx, ctx.previousFrames[ctx.previousName], ctx.keyframes.fan, {
              delay: ctx.previousName === 'selected' ? 0 : ctx.delay,
            });
          },
        }),
      ],
      exit: [
        assign<Context>({
          previousName: 'fan',
        }),
      ],
      on: {
        ANIMATE_ADJUSTMENT: {
          actions: choose([
            {
              cond: isBigScreen,
              actions: [
                assign<Context>({
                  animation: (ctx) => animate(ctx, ctx.previousFrames.fan, ctx.keyframes.fan),
                }),
              ],
            },
            {
              actions: [send('FLAT')],
            },
          ]),
        },
        FLAT: 'flat',
        SELECT: 'selected',
        TOGGLE_FAN: 'stacked',
      },
    },
    stacked: {
      entry: [
        assign<Context>({
          currentName: 'stack',
          previousFrames: (ctx) => ctx.keyframes,
          animation: (ctx) =>
            animate(ctx, ctx.previousFrames[ctx.previousName], ctx.keyframes.stack),
        }),
      ],
      exit: [
        assign<Context>({
          previousName: 'stack',
        }),
      ],
      on: {
        TOGGLE_FAN: [
          {
            target: 'fanned',
            cond: isBigScreen,
            actions: [assign<Context>({ delay: (_ctx, event: ToggleEvent) => event.delay })],
          },
          {
            target: 'flat',
          },
        ],
      },
    },
    flat: {
      entry: [
        assign<Context>({
          currentName: 'flat',
          previousFrames: (ctx) => ctx.keyframes,
          animation: (ctx) =>
            animate(ctx, ctx.previousFrames[ctx.previousName], ctx.keyframes.flat, {
              delay: ctx.previousName === 'selected' ? 0 : ctx.delay,
            }),
        }),
      ],
      exit: [
        assign<Context>({
          previousName: 'flat',
        }),
      ],
      on: {
        ANIMATE_ADJUSTMENT: {
          actions: choose([
            {
              cond: isSmallScreen,
              actions: [
                assign<Context>({
                  animation: (ctx) => animate(ctx, ctx.previousFrames.flat, ctx.keyframes.flat),
                }),
              ],
            },
            {
              actions: [send('FAN')],
            },
          ]),
        },
        FAN: 'fanned',
        SELECT: 'selected',
        TOGGLE_FAN: 'stacked',
      },
    },
    selected: {
      entry: [
        assign<Context>({
          currentName: 'selected',
          previousFrames: (ctx) => ctx.keyframes,
          animation: (ctx) => {
            return animate(ctx, ctx.previousFrames[ctx.previousName], ctx.keyframes.selected, {
              delay: 0,
            });
          },
        }),
      ],
      exit: [
        assign<Context>({
          previousName: 'selected',
        }),
      ],
      on: {
        SELECT: [
          {
            target: 'fanned',
            cond: isBigScreen,
          },
          {
            target: 'flat',
          },
        ],
        DESELECT: [
          {
            target: 'fanned',
            cond: isBigScreen,
          },
          {
            target: 'flat',
          },
        ],
      },
    },
  },
};
