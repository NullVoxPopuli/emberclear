import StoreService from 'ember-data/store';
import Service, { inject as service } from '@ember/service';
import { interpret, Interpreter, State } from 'xstate';
import { transferToDeviceMachine, Schema, Event, TRANSITION } from './machine';
import CurrentUserService from '../service';
import MessageDispatcher from 'emberclear/src/services/messages/dispatcher';

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
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;

  machine: Interpreter<{}, Schema, Event>;

  constructor(...args: any[]) {
    super(...args);

    this.machine = interpret(transferToDeviceMachine);
    this.machine.onTransition(listenerState => this.handleEvent(listenerState));
    this.machine.start();
  }

  private handleEvent(listenerState: State<{}, Event>) {
    const { event: { type: eventName }, value: currentState } = listenerState;

    switch (eventName) {
      case TRANSITION.START:
        console.log('started');
        break;
      default:
        console.log('not handled', eventName);

    }
  }

  test() {
    console.log('testing');
    this.machine.send('INITIATE_TRANSFER_REQUEST');
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'current-user/transfer-to-device': TransferToDevice;
  }
}
