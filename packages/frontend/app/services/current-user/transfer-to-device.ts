import Service from '@ember/service';
import { interpret, Interpreter } from 'xstate';
import { transferToDeviceMachine, Schema, Event, TRANSITION } from './machine';

export default class TransferToDevice extends Service {
  machine: Interpreter<{}, Schema, Event>;

  constructor(...args: any[]) {
    super(...args);

    this.machine = interpret(transferToDeviceMachine);
    console.log('machine');
    this.machine.onTransition(listenerState => {
      const { event: { type: eventName }, value: currentState } = listenerState;
      console.log('hi');

      console.log('transitioned', eventName, currentState, listenerState);

      this.handleEvent(eventName);
    });

    this.machine.start();
  }

  private handleEvent(eventName: string) {
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
