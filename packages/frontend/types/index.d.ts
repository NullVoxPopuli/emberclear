import ApplicationInstance from '@ember/application/instance';
import '@ember/component';
import '@ember/service';
import '@ember/test-helpers';
import 'ember-cli-htmlbars';
import 'qunit';

declare module '@ember/service' {
  interface Registry {
    ['notification-messages']: {
      clear(): void;
      clearAll(): void;
    };
  }
}

declare module '@ember/component' {
  // TODO:  remove when this is actually a thing that exists?
  export function setComponentTemplate(template: string, klass: any): any;
}

declare module '@ember/test-helpers' {
  interface Owner {
    lookup: <T>(name: string) => T;
    register: <T>(name: string, mockService: T) => void;
  }
  export interface AppContext {
    element: HTMLElement;
    owner: Owner & {
      application: {
        inject: (within: string, name: string, injected: string) => void;
      };
    };
  }

  export function getContext(): AppContext;
}

////////////////////////////////////////////////
// Custom things thrown on the global namespace
////////////////////////////////////////////////
declare global {
  interface Assert {
    contains: (source?: string | null, sub?: string, message?: string) => void;
    notContains: (source?: string | null, sub?: string, message?: string) => void;
    matches: (source?: string | null, regex?: RegExp, message?: string) => void;
    notMatches: (source?: string | null, regex?: RegExp, message?: string) => void;
  }

  //////////////////////////////////////////////
  // Things that TypeScript should already have
  //////////////////////////////////////////////
  interface Window {
    // Notification: Partial<Notification> & {
    //   permission: 'denied' | 'granted' | undefined;
    // };
    ServiceWorker: {};
    deferredInstallPrompt?: FakeBeforeInstallPromptEvent;
  }

  interface UserChoice {
    outcome: 'accepted' | undefined;
  }
  // why is this not a built in type?
  interface FakeBeforeInstallPromptEvent {
    prompt: () => Promise<void>;
    userChoice: Promise<UserChoice>;
  }
}
