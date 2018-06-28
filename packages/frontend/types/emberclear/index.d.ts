import Ember from 'ember';


declare global {
  interface IdentityJson {
    name: string;
    publicKey: string;
  }

  interface FastBoot {
    isFastBoot: boolean;
    request: {
      path: string;
      host: string;
    }
  }

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
  interface Intl {
    t(translation: string, options?: any): string;
  }

  interface RelayMessage {
    uid: string;
    message: string;
  }
}

//
// // https://github.com/typed-ember/ember-cli-typescript/issues/197#issuecomment-384645960
// declare module '@ember/debug' {
//   declare function assert<T extends boolean>(desc: string, test?: T): T extends true ? void : never;
// }


declare module '@ember/service' {
  interface Registry {
    'toast': Toast,
    'intl': Intl,
  }
}
