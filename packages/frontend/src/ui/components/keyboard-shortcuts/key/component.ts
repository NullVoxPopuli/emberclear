import Component from '@glimmer/component';

interface IArgs {
  label: string;
}

export default class Key extends Component<IArgs> {
  get i18nKey() {
    const { label } = this.args;

    return `ui.shortcuts.key.${label}`;
  }
}
