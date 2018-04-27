
import Ember from 'ember';

declare global {
  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}
}

export {};
//
// // https://github.com/typed-ember/ember-cli-typescript/issues/197#issuecomment-384645960
// declare module '@ember/debug' {
//   declare function assert<T extends boolean>(desc: string, test?: T): T extends true ? void : never;
// }
