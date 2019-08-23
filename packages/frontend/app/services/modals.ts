import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

interface IModalArgs {
  name: string;
  isActive: boolean;
}

class ModalState {
  @tracked name!: string;
  @tracked isActive!: boolean;

  constructor(args: IModalArgs) {
    this.name = args.name;
    this.isActive = args.isActive;
  }
}

export default class Modals extends Service {
  @tracked modals: ModalState[] = [];

  toggle(name: string) {
    const modal = this.find(name);

    modal.isActive = !modal.isActive;
  }

  close(name: string) {
    const modal = this.find(name);

    modal.isActive = false;
  }

  open(name: string) {
    const modal = this.find(name);

    modal.isActive = true;
  }

  isVisible(name: string) {
    const modal = this.find(name);

    return modal.isActive;
  }

  find(name: string) {
    const modal = this.modals.find(m => m.name === name);

    if (!modal) {
      const newModal = new ModalState({ name, isActive: false });

      this.modals.push(newModal);

      return newModal;
    }

    return modal;
  }
}
