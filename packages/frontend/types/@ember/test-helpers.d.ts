import ApplicationInstance from '@ember/application/instance';

interface AppContext {
  element: HTMLElement;
  owner: ApplicationInstance;
}

export function getContext(): AppContext;
