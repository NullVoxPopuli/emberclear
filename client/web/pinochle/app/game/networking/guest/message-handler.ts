import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './statecharts/message-handler';

import type { GameHost } from '../host';
import type { Context, Event, Schema } from './statecharts/message-handler';
import type { MessageFromHost } from './types';

export class MessageHandler {
  constructor(public host: GameHost) {}

  @use
  interpreter = new Statechart<Context, Schema, Event>(() => {
    return {
      named: {
        chart: statechart,
        config: {
          actions: {},
          guards: {},
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      },
    };
  });

  @action
  handle(msg: MessageFromHost) {
    this.interpreter.send(msg);
  }

  @action
  _ping(toId: string) {
    this.host.sendToHex({ type: 'PING' }, toId);
  }

  @action
  _pong(toId: string) {
    this.host.sendToHex({ type: 'PONG' }, toId);
  }

  @action
  _gameFull(toId: string) {
    this.host.sendToHex({ type: 'GAME_FULL' }, toId);
  }
}
