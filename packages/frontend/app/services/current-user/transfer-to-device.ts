import StoreService from 'ember-data/store';
import RouterService from '@ember/routing/router-service';

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
  @service router!: RouterService;
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

    // This represents the linear flow of the state machine between the two computers
    switch (eventName) {
      case TRANSITION.START:
        // ---- Initiator: 1
        // generate ephemeral keys
        // generate QR Code to Scan
        // - only contains public key
        // create a second connection to the relay
        // TODO: need to support additional connections
        //
        // these things could be route based.
        // maybe this transition handler just ... transitions to a route.
        this.router.transitionTo('settings.transfer-to-device');
        break;
      case TRANSITION.SCAN_TARGET_PROFILE:
        // ---- Receiver: 1
        // prior to this step, the receiver will need to go to the
        // login screen, and click import from another device or something.
        // this person must scan the QR code on the initiator's screen.
        // then, generate ephemeral keys in order to communicate encryptedly
        // send the ready message.

        // NOTE: this step should be very fast (as it's automated)
        //       not sure if it's worth showing a loading/spinner or anything
        this.router.transitionTo('login.import-from-device');
        break;
      case TRANSITION.SEND_READY:
        // ---- Receiver: 2
        // ready message is sent to initiator, as we are now connected
        // transition to a screen showing that we can enter the code
        // TODO: we may want a way to integrate the state machine restrictions
        //       into the router
        this.router.transitionTo('login.import-from-device.enter-code');
        break;
      case TRANSITION.RECEIVE_READY:
        // ---- Initiator 2:
        // A connection is now established with both sets of ephemeral keys
        // Generate a short code that can be typed on the receiver's screen,
        // This code is only transferred visually, and not via QR, in case
        // there are other QR scanners nearby.
        this.router.transitionTo('settings.transfer-to-device.waiting-for-auth');
        break;
      case TRANSITION.SEND_CODE:
        // ---- Receiver: 3
        // Once the code is manually read off the screen and typed in on
        // the receiver's computer, the code is sent over the ephemeral
        // channel so that the initiator can confirm it.
        // This is an auth attempt.
        this.router.transitionTo('login.import-from-device.waiting-for-data');
        break;
      case TRANSITION.RECEIVE_CODE:
        // ---- Initiator: 3
        // upon receiving the code, we can transition to another route that
        // begins the sending of the data: keys, contacts, messages, etc
        this.router.transitionTo('settings.transfer-to-device.send-data');
        break;
      case TRANSITION.DATA_SENT:
        // ---- Initiator: 4
        // data sent. Waiting on the receiver to finish.
        // waiting for confirmation (via sha)
        this.router.transitionTo('settings.transfer-to-device.done');
        break;
      case TRANSITION.DATA_RECEIVED:
        // ---- Receiver: 4
        // data received, import it.
        this.router.transitionTo('login.import-from-device.done');
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
