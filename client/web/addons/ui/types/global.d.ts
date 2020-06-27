// Types for compiled templates
declare module '@emberclear/ui/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}

import '@ember/component';

declare module '@ember/component' {
  export const setComponentTemplate: any;
}
