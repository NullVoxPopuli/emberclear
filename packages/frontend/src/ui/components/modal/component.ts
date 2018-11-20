import Component, { tracked } from 'sparkles-component';
// import fade from 'ember-animated/transitions/fade';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class Modal extends Component<IArgs> {
  // fade = fade;
}
