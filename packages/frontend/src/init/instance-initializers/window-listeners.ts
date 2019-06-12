import ApplicationInstance from '@ember/application/instance';

export function initialize(appInstance: ApplicationInstance) {
  if (!window || typeof window.addEventListener !== 'function') return;

  const windowService = appInstance.lookup('service:window');

  window.addEventListener('beforeinstallprompt', (event: any) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    event.preventDefault();
    // Stash the event so it can be triggered later.
    const deferredPrompt = event;

    windowService.deferredInstallPrompt = deferredPrompt;
  });
}

export default {
  initialize,
};
