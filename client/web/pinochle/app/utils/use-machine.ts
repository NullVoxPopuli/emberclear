import { DEBUG } from '@glimmer/env';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { cancel, later } from '@ember/runloop';

import { Resource } from 'ember-could-get-used-to-this';
import { createMachine, interpret } from 'xstate';

import type {
  EventObject,
  Interpreter,
  MachineConfig,
  MachineOptions,
  State,
  StateMachine,
  StateSchema,
  Typestate,
} from 'xstate';
import type { StateListener } from 'xstate/lib/interpreter';

const INTERPRETER = Symbol('interpreter');
const CONFIG = Symbol('config');
const MACHINE = Symbol('machine');

const ERROR_CANT_RECONFIGURE = `Cannot re-invoke withContext after the interpreter has been initialized`;
const ERROR_CHART_MISSING = `A statechart was not passed`;

type Args<Context, Schema extends StateSchema, Event extends EventObject> = {
  positional?: [MachineConfig<Context, Schema, Event>];
  named?: {
    chart: MachineConfig<Context, Schema, Event>;
    config?: Partial<MachineOptions<Context, Event>>;
    context?: Context;
    initialState?: State<Context, Event>;
    onTransition?: StateListener<Context, Event, Schema, Typestate<Context>>;
  };
};

type SendArgs<Context, Schema extends StateSchema, Event extends EventObject> = Parameters<
  Interpreter<Context, Schema, Event>['send']
>;

/**
 *
  @use
  interpreter = new Statechart(() => [statechart])
    .withContext(this.context).withConfig({
      actions: {
        returnSelectedToHand: this._returnSelectedToHand,
        showSelected: this._showSelected,
        closeHand: this._closeHand,
        fanOpen: this._fanOpen,
        adjustHand: this._adjustHand,
      },
      guards: {},
    });
 */
export class Statechart<
  Context,
  Schema extends StateSchema,
  Event extends EventObject
> extends Resource<Args<Context, Schema, Event>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  declare [MACHINE]: StateMachine<any, Schema, Event>;
  declare [INTERPRETER]: Interpreter<Context, Schema, Event>;

  @tracked declare state: State<Context, Event>;

  /**
   * This is the return value of `new Statechart(() => ...)`
   */
  get value(): {
    state: State<Context, Event>;
    send: Statechart<Context, Schema, Event>['send'];
    // withContext: Statechart<Context, Schema, Event>['withContext'];
    // withConfig: Statechart<Context, Schema, Event>['withConfig'];
    // onTransition: Statechart<Context, Schema, Event>['onTransition'];
  } {
    if (!this[INTERPRETER]) {
      this._setupMachine();
    }

    assert(`Expected state to exist`, this.state);

    return {
      // For TypeScript, this is tricky because this is what is accessible at the call site
      // but typescript thinks the context is the class instance.
      //
      // To remedy, each property has to also exist on the class body under the same name
      state: this.state,
      send: this.send,

      /**
       * One Time methods
       * Currently disabled due to issues with the use/resource transform not allowing
       * the builder pattern
       *
       * If the transform is fixed, we can remove the protected visibility modifier
       * and uncomment out these three lines in a back-compat way for existing users
       */
      // withContext: this.withContext,
      // withConfig: this.withConfig,
      // onTransition: this.onTransition,
    };
  }

  @action
  protected withContext(context?: Context) {
    assert(ERROR_CANT_RECONFIGURE, !this[INTERPRETER]);

    if (context) {
      this[MACHINE] = this[MACHINE].withContext(context);
    }

    return this;
  }

  @action
  protected withConfig(config?: Partial<MachineOptions<Context, Event>>) {
    assert(ERROR_CANT_RECONFIGURE, !this[INTERPRETER]);

    if (config) {
      this[MACHINE] = this[MACHINE].withConfig({
        ...config,
        actions: {
          ...config.actions,
        },
      });
    }

    return this;
  }

  @action
  protected onTransition(fn?: StateListener<Context, Event, Schema, Typestate<Context>>) {
    if (!this[INTERPRETER]) {
      this._setupMachine();
    }

    if (fn) {
      this[INTERPRETER].onTransition(fn);
    }

    return this;
  }

  /**
   * Private
   */

  private get [CONFIG]() {
    return this.args.named;
  }

  @action
  send(...args: SendArgs<Context, Schema, Event>) {
    return this[INTERPRETER].send(...args);
  }

  @action
  private _setupMachine() {
    this.withContext(this[CONFIG]?.context);
    this.withConfig(this[CONFIG]?.config);

    let state = this[CONFIG]?.initialState;

    if (state) {
      // this[MACHINE].resolveState(State.from(state));
    }

    this[INTERPRETER] = interpret(this[MACHINE], {
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
      this.state = state;

      // console.log('state:', state.toJSON());
    });

    this.onTransition(this[CONFIG]?.onTransition);

    this[INTERPRETER].start();
  }

  /**
   * Lifecycle methods on Resource
   *
   */
  @action
  protected setup() {
    let statechart = this.args.positional?.[0] || this.args.named?.chart;

    assert(ERROR_CHART_MISSING, statechart);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this[MACHINE] = createMachine(statechart as any);
  }

  protected teardown() {
    if (!this[INTERPRETER]) return;

    this[INTERPRETER].stop();
  }
}
