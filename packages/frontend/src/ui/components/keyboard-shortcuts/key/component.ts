import Component, { tracked } from 'sparkles-component';

interface IArgs {
  label: string;
}

export default class Key extends Component<IArgs> {
  @tracked
  get i18nKey() {
    const { label } = this.args;

    return `ui.shortcuts.key.${label}`;
  }
}
