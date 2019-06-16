import ApplicationInstance from '@ember/application/instance';

declare module '@ember/test-helpers' {
  interface AppContext {
    element: HTMLElement;
    owner: {
      application: ApplicationInstance;
      register: (name: string, obj: any) => void;
      lookup: <T = any>(name: string) => T;
    };
  }

  export function getContext(): AppContext;
}

declare module '@ember/service' {
  interface Registry {
    ['notification-messages']: {
      clear(): void;
      clearAll(): void;
    };
  }
}

declare global {
  interface UserChoice {
    outcome: 'accepted' | undefined;
  }

  // why is this not a built in type?
  interface FakeBeforeInstallPromptEvent {
    prompt: () => Promise<void>;
    userChoice: Promise<UserChoice>;
  }

  interface Assert {
    contains: (source?: string | null, sub?: string, message?: string) => void;
  }

  interface Window {
    Notification: Partial<Notification> & {
      permission: 'denied' | 'granted' | undefined;
    };
    ServiceWorker: {};
    deferredInstallPrompt?: FakeBeforeInstallPromptEvent;
  }

  interface Navigator {
    permissions: {
      revoke(opts: any): Promise<void>;
    };
  }
}
