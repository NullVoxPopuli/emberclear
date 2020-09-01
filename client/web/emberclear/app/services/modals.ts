import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

interface IModalArgs {
  name: string;
  isActive: boolean;
}

class ModalState {
  @tracked declare name: string;
  @tracked declare isActive: boolean;

  constructor(args: IModalArgs) {
    this.name = args.name;
    this.isActive = args.isActive;
  }

  open() {
    this.isActive = true;
  }

  close() {
    this.isActive = false;
  }

  toggle() {
    this.isActive = !this.isActive;
  }
}

export default class Modals extends Service {
  @tracked modals: ModalState[] = [];

  toggle(name: string) {
    this.find(name).toggle();
  }

  close(name: string) {
    this.find(name).close();
  }

  open(name: string) {
    this.find(name).open();
  }

  isVisible(name: string) {
    return this.find(name).isActive;
  }

  find(name: string) {
    let modal = this.modals.find((m) => m.name === name);

    if (!modal) {
      let newModal = new ModalState({ name, isActive: false });

      this.modals.push(newModal);

      return newModal;
    }

    return modal;
  }
}
