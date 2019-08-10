import Component from '@glimmer/component';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class Modal extends Component<IArgs> {}
