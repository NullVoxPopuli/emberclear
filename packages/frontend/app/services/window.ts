import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
// import { useEffect } from 'emberclear/utils/decorators';

export default class WindowService extends Service {
  @tracked deferredInstallPrompt?: FakeBeforeInstallPromptEvent;
  @tracked isInstalled = false;

  cleanup: any[] = [];

  constructor() {
    super(...arguments);

    this.cleanup.push(this.checkForDeferredInstall());
  }

  willDestroy() {
    this.cleanup.forEach(method => method());
  }

  // @useEffect
  checkForDeferredInstall() {
    const interval = setInterval(() => {
      this.deferredInstallPrompt = window.deferredInstallPrompt;

      if (this.deferredInstallPrompt) {
        clearInterval(interval);

        this.deferredInstallPrompt.userChoice.then(choice => {
          this.isInstalled = choice.outcome === 'accepted';
        });
      }
    }, 250);

    return () => clearInterval(interval);
  }

  get canInstall() {
    return this.hasDeferredInstall && !this.isInstalled;
  }

  get hasDeferredInstall() {
    return !!this.deferredInstallPrompt;
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
