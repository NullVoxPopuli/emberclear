declare module 'ember-cli-htmlbars-inline-precompile' {
  export default function hbs(template: TemplateStringsArray, ...args: any[]): string;
}

declare module '@ember/service' {
  interface Registry {
    ['notification-messages']: {
      clear(): void;
      clearAll(): void;
    };
  }
}

// declare module '@ember/component' {
//   // TODO:  remove when this is actually a thing that exists?
//   export function setComponentTemplate(template: string, klass: any): any;
// }

//////////////////////////////////////////////
// Things that TypeScript should already have
//////////////////////////////////////////////
declare interface Window {
  Notification: Partial<Notification> & {
    permission: 'denied' | 'granted' | undefined;
  };
  ServiceWorker: {};
  deferredInstallPrompt?: FakeBeforeInstallPromptEvent;
}

declare interface UserChoice {
  outcome: 'accepted' | undefined;
}
// why is this not a built in type?
declare interface FakeBeforeInstallPromptEvent {
  prompt: () => Promise<void>;
  userChoice: Promise<UserChoice>;
}

////////////////////////////////////////////////
// Custom things thrown on the global namespace
////////////////////////////////////////////////
declare interface Assert {
  contains: (source?: string | null, sub?: string, message?: string) => void;
}
