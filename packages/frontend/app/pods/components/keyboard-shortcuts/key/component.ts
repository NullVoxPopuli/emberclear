import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

interface IArgs {
  label: string;
}

class Key extends Component<IArgs> {
  get i18nKey() {
    const { label } = this.args;

    return `ui.shortcuts.key.${label}`;
  }
}

export default setComponentTemplate(
  hbs`
  <i class='key'>{{t this.i18nKey}}</i>
  `,
  Key
);
