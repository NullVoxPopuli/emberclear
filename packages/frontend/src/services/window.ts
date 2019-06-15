import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { monitor } from 'ember-computed-promise-monitor';
import { computed } from '@ember/object';

interface UserChoice {
  outcome: 'accepted' | undefined;
}

// why is this not a built in type?
interface FakeBeforeInstallPromptEvent {
  prompt: () => Promise<void>;
  userChoice: Promise<UserChoice>;
}

export default class WindowService extends Service {
  deferredInstallPrompt?: FakeBeforeInstallPromptEvent = (window as any).deferredInstallPrompt;

  get hasDeferredInstall() {
    return !!this.deferredInstallPrompt;
  }

  get isInstalled() {
    const result = (this.installStatus as any).result as UserChoice;

    return (result as UserChoice).outcome === 'accepted';
  }

  @computed()
  @monitor
  get installStatus() {
    if (!this.deferredInstallPrompt) return;

    return this.deferredInstallPrompt.userChoice;
  }

  async promptInstall() {
    if (!this.deferredInstallPrompt) return;

    await this.deferredInstallPrompt.prompt();
  }
}
