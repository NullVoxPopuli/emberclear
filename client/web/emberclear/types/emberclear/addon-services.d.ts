import '@ember/service';

declare global {
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
}

declare module '@ember/service' {
  interface Registry {
    toast: Toast;
    intl: Intl;
    ['notification-messages']: {
      clear(): void;
      clearAll(): void;
    };
  }
}
