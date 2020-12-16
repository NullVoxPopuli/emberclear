import { DEBUG } from '@glimmer/env';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cancel, later } from '@ember/runloop';

import { Resource } from 'ember-could-get-used-to-this';
import { createMachine, interpret } from 'xstate';

import type {
  EventObject,
  Interpreter,
  MachineConfig,
  State,
  StateSchema,
  Typestate,
} from 'xstate';
import type { StateListener } from 'xstate/lib/interpreter';

const INTERPRETER = Symbol('interpreter');
const CONFIG = Symbol('config');

type Args<Context, Schema extends StateSchema, Event extends EventObject> = {
  named: {
    chart: MachineConfig<Context, Schema, Event>;
    initialState?: State<Context, Event>;
    config?: unknown;
    context?: unknown;
    onTransition?: StateListener<Context, Event, Schema, Typestate<Context>>;
  };
};

type SendArgs<Context, Schema extends StateSchema, Event extends EventObject> = Parameters<
  Interpreter<Context, Schema, Event>['send']
>;

/**
 *
 * @use interpreter = new Statechart(() => {
    return { named: {
      chart: machineConfig,
      initialState: { ... },
      config: { ... },
      context: { ... },
      onTransition() {

      }
    }, };
  });
 */
export class Statechart<
  Context,
  Schema extends StateSchema,
  Event extends EventObject
> extends Resource<Args<Context, Schema, Event>> {
  declare [CONFIG]: Args<Context, Schema, Event>['named'];
  declare [INTERPRETER]: Interpreter<Context, Schema, Event>;

  @tracked __state__?: State<Context, Event>;

  constructor(owner: unknown, args: Args<Context, Schema, Event>) {
    super(owner, args);

    this[CONFIG] = args.named;
  }

  get value(): {
    state?: State<Context, Event>;
  } {
    if (!this[INTERPRETER]) {
      this.setup();
    }

    return {
      state: this.__state__,
    };
  }

  @action
  send(...args: SendArgs<Context, Schema, Event>) {
    return this[INTERPRETER].send(...args);
  }

  @action
  setup() {
    let machine = createMachine(this[CONFIG].chart);

    this[INTERPRETER] = interpret(machine, {
      devTools: DEBUG,
      clock: {
        setTimeout(fn, ms) {
          return later.call(null, fn, ms);
        },
        clearTimeout(timer) {
          return cancel.call(null, timer);
        },
      },
    }).onTransition((state) => {
      this.__state__ = state;
    });

    let transition = this[CONFIG].onTransition;

    if (transition) {
      this[INTERPRETER].onTransition(transition);
    }

    this[INTERPRETER].start(this[CONFIG].initialState);
  }

  teardown() {
    if (!this[INTERPRETER]) return;

    this[INTERPRETER].stop();
  }
}
