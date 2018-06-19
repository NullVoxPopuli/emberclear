import Application from '@ember/application';

// https://love2dev.com/blog/beforeinstallprompt/
export function initialize(application: Application): void {
  // application.inject('route', 'foo', 'service:foo');
  if(!window || typeof(window.addEventListener) !== 'function') return;

  window.addEventListener('beforeinstallprompt', event => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
    event.preventDefault();
    // Stash the event so it can be triggered later.
    const deferredPrompt = event;

    deferredPrompt.prompt();

    // const choice = await defferedPrompt.userChoice
  });
}

export default {
  initialize
};
