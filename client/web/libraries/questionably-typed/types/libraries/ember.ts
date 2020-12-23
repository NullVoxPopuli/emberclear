/* eslint-disable @typescript-eslint/no-explicit-any */
import 'ember';
import '@ember/component';
// import '@ember/component/helper';
// import '@ember/helper';

import type { TemplateFactory } from 'ember-cli-htmlbars';

type TF = TemplateFactory;

declare module '@ember/component' {
  // TODO:  remove when this is actually a thing that exists?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function setComponentTemplate(template: TF, klass: any): any;
}

// Types are not published. Must use the polyfill for its types
// declare module '@ember/destroyable' {
//   export function associateDestroyableChild(parent: any, child: any): any;
//   export function registerDestructor(child: any, childMethod: () => any): any;
// }

// import type Helper from '@ember/component/helper';

// type EmberHelper = Helper;

// declare module '@ember/helper' {
//   // TODO:  remove when this is actually a thing that exists?
//   export function invokeHelper<Klass extends EmberHelper>(
//     ctx: unknown,
//     klass: { new(): Klass },
//     argFactory: () => unknown[]
//   ): ReturnType<Klass['compute']>;
// }

// no longer needed
// import '@ember/test-waiters';
// declare module '@ember/test-waiters' {
//   type WaitForPromise = (x: any) => PromiseLike<void>;

//   export const waitForPromise: WaitForPromise;
// }
