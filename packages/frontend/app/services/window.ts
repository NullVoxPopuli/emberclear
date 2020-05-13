import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class WindowService extends Service {
  @tracked deferredInstallPrompt?: FakeBeforeInstallPromptEvent;
  @tracked isInstalled = false;
  @tracked hasDeferredInstall = false;

  cleanup: any[] = [];

  // aliases, to allow for easier / more predictable stubbing
  Notification = window.Notification;

  constructor(...args: any[]) {
    super(...args);

    this.cleanup.push(this.checkForDeferredInstall());
  }

  get location() {
    return window.location;
  }

  willDestroy() {
    this.cleanup.forEach((method) => method());
  }

  checkForDeferredInstall() {
    const interval = setInterval(() => {
      this.deferredInstallPrompt = window.deferredInstallPrompt;

      if (this.deferredInstallPrompt) {
        clearInterval(interval);
        this.hasDeferredInstall = true;

        return this.deferredInstallPrompt.userChoice.then((choice) => {
          this.isInstalled = choice.outcome === 'accepted';
        });
      }
    }, 250);

    return () => clearInterval(interval);
  }

  get canInstall() {
    return this.hasDeferredInstall && !this.isInstalled;
  }

  async promptInstall() {
    if (!this.deferredInstallPrompt) return;

    await this.deferredInstallPrompt.prompt();

    await this.evaluateInstallPrompt();
  }

  async evaluateInstallPrompt() {
    if (!this.deferredInstallPrompt) return;

    const choice = await this.deferredInstallPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      this.isInstalled = true;
    } else {
      this.deferredInstallPrompt = undefined;
    }
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    window: WindowService;
  }
}
