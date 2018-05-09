
import Ember from 'ember';

declare global {
  interface Window {
    devToolsExtension: any
  }

  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}

  // https://github.com/knownasilya/ember-toastr/blob/master/addon/services/toast.js
  interface Toast {
    [method: string]: (message: string, title?: string, options?: any) => void;
    success(message: string, title?: string, options?: any): void;
    info(message: string, title?: string, options?: any): void;
    warning(message: string, title?: string, options?: any): void;
    error(message: string, title?: string, options?: any): void;
  }

  // https://github.com/jamesarosen/ember-i18n/blob/master/addon/services/i18n.js
  interface I18n {
    t(translation: string, options?: any): string;
  }
}


//
// // https://github.com/typed-ember/ember-cli-typescript/issues/197#issuecomment-384645960
// declare module '@ember/debug' {
//   declare function assert<T extends boolean>(desc: string, test?: T): T extends true ? void : never;
// }





// https://github.com/ember-redux/ember-redux/blob/master/addon/services/redux.js
// declare interface Redux {
//   getState(): any;
//   dispatch(action: string): any;
// }

declare module '@ember/service' {
  interface Registry {
    'toast': Toast,
    'i18n': I18n,
    // 'redux': Redux
  }
}
