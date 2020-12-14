import { setAssetPath, SlButton, SlSwitch } from '@shoelace-style/shoelace';

export default {
  initialize() {
    setAssetPath(document.currentScript.src);
    window.customElements.define('sl-button', SlButton);
    window.customElements.define('sl-switch', SlSwitch);
  },
};
