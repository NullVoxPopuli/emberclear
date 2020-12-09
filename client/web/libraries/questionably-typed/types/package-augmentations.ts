import 'ember';
import '@ember/component';


import type { TemplateFactory } from 'ember-cli-htmlbars';

type TF = TemplateFactory;

declare module '@ember/component' {
  // TODO:  remove when this is actually a thing that exists?
  export function setComponentTemplate(template: TF, klass: any): any;
}

// no longer needed
// import '@ember/test-waiters';
// declare module '@ember/test-waiters' {
//   type WaitForPromise = (x: any) => PromiseLike<void>;

//   export const waitForPromise: WaitForPromise;
// }

