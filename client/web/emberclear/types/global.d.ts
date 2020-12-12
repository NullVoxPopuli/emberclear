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

declare module 'ember-concurrency-test-waiter/define-modifier' {
  const foo: any;
  export default foo;
}

declare module 'ember-raf-scheduler/test-support/register-waiter' {
  const foo: any;
  export default foo;
}
