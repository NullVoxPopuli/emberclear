import Service from '@ember/service';
import EmberObject from '@ember/object';

interface IModalArgs {
  name: string;
  isActive: boolean;
}

class ModalState extends EmberObject {
  name!: string;
  isActive!: boolean;

  constructor(args: IModalArgs) {
    super();

    this.name = args.name;
    this.isActive = args.isActive;
  }
}

export default class Modals extends Service {
  modals: ModalState[] = [];

  toggle(name: string) {
    const modal = this.find(name);

    modal.set('isActive', !modal.isActive);
  }

  close(name: string) {
    const modal = this.find(name);

    modal.set('isActive', false);
  }

  open(name: string) {
    const modal = this.find(name);

    modal.set('isActive', true);
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
