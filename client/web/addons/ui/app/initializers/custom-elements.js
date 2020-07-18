import { Button, Switch } from '@shoelace-style/shoelace';

export default {
  initialize() {
    if (window && window.customElements) {
      console.log(Button);
      window.customElements.define('sl-button', Button);
      window.customElements.define('sl-switch', Switch);
    }
  },
};
