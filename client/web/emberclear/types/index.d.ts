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

////////////////////////////////////////////////
// Custom things thrown on the global namespace
////////////////////////////////////////////////
declare global {
  type Dict<T = string> = { [key: string]: T };
  type TODO<T = any> = T;

  //////////////////////////////////////////////
  // Things that TypeScript should already have
  //////////////////////////////////////////////
  interface Window {
    // Notification: Partial<Notification> & {
    //   permission: 'denied' | 'granted' | undefined;
    // };
    ServiceWorker: unknown;
    deferredInstallPrompt?: FakeBeforeInstallPromptEvent;
    ASSET_FINGERPRINT_HASH: string;
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
