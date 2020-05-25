import Component from '@glimmer/component';

import { useMachine } from 'ember-statecharts';
import { use } from 'ember-usable';
import { machineConfig } from './-machine';

export default class Login extends Component {
  @use interpreter = useMachine(machineConfig);

  get state() {
    return this.interpreter?.currentState?.toStrings();
  }
}
