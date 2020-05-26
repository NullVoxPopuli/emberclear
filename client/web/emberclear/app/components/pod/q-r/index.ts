import Component from '@glimmer/component';
import { action } from '@ember/object';

import { StateMachine } from './state-machine';

export default class QRScan extends Component {
  // not implemented yet, but this should probably be an addon
  @use machine = useDestroyable(StateMachine);


  get state() {
    return this.machine.state?.toStrings();
  }

  get ctx() {
    return this.machine?.context;
  }

  @action
  handleScan(data: string) {
    this.machine.send('SCAN', { data });
  }

  @action
  transition(transitionName: string) {
    this.machine.send(transitionName);
  }

}
