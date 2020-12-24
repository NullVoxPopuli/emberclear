// Types for compiled templates
// declare module 'emberclear/templates/*' {
//   import type { TemplateFactory } from 'htmlbars-inline-precompile';
//   const tmpl: TemplateFactory;
//   export default tmpl;
// }

declare module '@ember/destroyable' {
  export const associateDestroyableChild: any;
  export const registerDestructor: any;
}

