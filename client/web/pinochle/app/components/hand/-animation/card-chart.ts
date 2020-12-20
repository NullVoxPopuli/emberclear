import { assign, send } from 'xstate';
import { choose } from 'xstate/lib/actions';

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
  keyframes: Keyframes;
  isSmallScreen: boolean;

  // Temp state for animating
  previousFrames: Keyframes;
  delay?: number;
  currentName: keyof Keyframes;
  previousName: keyof Keyframes;
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
  | { type: 'REFAN' }
  | { type: 'STACK' }
  | { type: 'FLAT' }
  | { type: 'REFLAT' }
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

function animate(context: Context, next: Keyframe, options: KeyframeAnimationOptions = {}) {
  /**
   * NOTE: pausing causes jitters
   * NOTE: cancelling removes the possibility of resuming mid-way through a transition
   *
   * Not doing anything lets the built-in tweening happen and provides smooth
   * transitions between states.
   */
  // if (context.animation) {
  // context.animation.pause();
  // context.animation.cancel();
  // }

  return context.element.animate([next], {
    ...DEFAULT_ANIMATION_OPTIONS,
    delay: context.delay,
    ...options,
  });
}

function toSelection(ctx: Context) {
  return animate(ctx, ctx.keyframes.selected, {
    delay: 0,
  });
}

function toFlat(ctx: Context) {
  return animate(ctx, ctx.keyframes.flat, {
    delay: ctx.previousName === 'selected' ? 0 : ctx.delay,
  });
}

function toStack(ctx: Context) {
  return animate(ctx, ctx.keyframes.stack);
}

function toFan(ctx: Context) {
  return animate(ctx, ctx.keyframes.fan, {
    delay: ctx.previousName === 'selected' ? 0 : ctx.delay,
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
        }),
        toFan,
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
              actions: [send('REFAN')],
            },
            {
              actions: [send('FLAT')],
            },
          ]),
        },
        FLAT: 'flat',
        SELECT: 'selected',
        TOGGLE_FAN: 'stacked',
        REFAN: 'fanned',
      },
    },
    stacked: {
      entry: [
        assign<Context>({
          currentName: 'stack',
          previousFrames: (ctx) => ctx.keyframes,
        }),
        toStack,
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
            actions: [assign({ delay: (_ctx, event: ToggleEvent) => event.delay })],
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
        }),
        toFlat,
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
              actions: [send('REFLAT')],
            },
            {
              actions: [send('FAN')],
            },
          ]),
        },
        FAN: 'fanned',
        REFLAT: 'flat',
        SELECT: 'selected',
        TOGGLE_FAN: 'stacked',
      },
    },
    selected: {
      entry: [
        assign<Context>({
          currentName: 'selected',
          previousFrames: (ctx) => ctx.keyframes,
        }),
        toSelection,
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
