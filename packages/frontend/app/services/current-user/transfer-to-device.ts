import StoreService from 'ember-data/store';
import RouterService from '@ember/routing/router-service';
import { action } from '@ember/object';

import Service, { inject as service } from '@ember/service';
import { interpret, Interpreter } from 'xstate';
import { transferToDeviceMachine } from './state-machines/transfer-to-device';
import { Event, Schema, Context } from './state-machines/tranfer-to-device.types';

import CurrentUserService from '../current-user';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';

/**
 * This machine is always available (hence start in the constructor).
 * At any given moment, a transfer to device may be initiated or received.
 *
 * handling messages from the network happens in the
 * messages/handler service.
 *
 * methods in the messages/handler service will call back to here.
 */
export default class TransferToDevice extends Service {
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;
  @service router!: RouterService;
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;

  machine: Interpreter<Context, Schema, Event>;

  constructor(...args: any[]) {
    super(...args);

    let configured = transferToDeviceMachine.withConfig({
      actions: {
        generateEphemeralKeys: () => {},
        establishConnection: () => {},
        destroyConnection: () => {},
        generateSecretCode: () => {},
        onAuthorizationSuccess: () => {},
        onAuthorizationFailure: () => {},
        hashData: () => {},
        sendData: () => {},
        onDataVerificationSuccess: () => {},
        onDataVerificationFailure: () => {},
        onSendRetry: () => {},
      },
    });

    this.machine = interpret(configured)
      .onTransition(state => console.log(state))
      .start();
  }

  @action start() {
    this.machine.send('SOURCE_INITIATE');
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'current-user/transfer-to-device': TransferToDevice;
  }
}
