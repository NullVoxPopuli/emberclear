import Component from '@ember/component';

import { State } from 'xstate';

type Sadness = any;

type UnknownState = State<Sadness, Sadness, Sadness>;

export default class SwitchStateControl extends Component {
  static positionalParams = ['current'];

  current?: State<Sadness, Sadness, Sadness>;

  tagName = '';

  is = is;
  anyOf = anyOf;

  get ctx() {
    return this.current?.context;
  }
}

function is(state: UnknownState, statePath: string) {
  return state.matches(statePath);
}

function anyOf(state: UnknownState, ...statePaths: string[]) {
  let result = statePaths.some((statePath) => is(state, statePath));

  return result;
}
