import { compose } from 'redux';

const devtools = window.devToolsExtension ?
  window.devToolsExtension() :
  (f: any) => f;

export default compose(devtools);
