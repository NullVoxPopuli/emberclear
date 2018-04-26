import { compose } from 'redux';

const devtools = window.devToolsExtension ?
  window.devToolsExtension() :
  f => f;

export default compose(devtools);
