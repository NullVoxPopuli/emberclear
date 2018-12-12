import Component, { tracked } from 'sparkles-component';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class Modal extends Component<IArgs> {}
