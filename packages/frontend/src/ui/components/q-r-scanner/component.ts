import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { gt } from '@ember-decorators/object/computed';
import Instascan from 'instascan';

import { NoCameraError } from 'emberclear/src/utils/errors';

const { Scanner, Camera } = Instascan;

// inspiration from previous work here:
// https://github.com/NullVoxPopuli/tanqueReact/blob/master/js/components/-components/qr-scanner/index.jsx
export default class QRScanner extends Component {
  // args
  onScan!: (qrContent: string) => void;
  onError!: (error: Error) => void;

  cameras: Camera[] = [];
  scanner?: Scanner = undefined;
  activeCamera?: Camera = undefined;

  @gt('cameras.length', 1) showCameras!: boolean;

  didInsertElement() {
    this.mountScanner();
  }

  willDestroyElement() {
    this.unmountScanner();
  }

  async unmountScanner(this: QRScanner) {
    if (!this.scanner) return;

    await this.scanner.stop();
  }

  async mountScanner(this: QRScanner) {
    const scanner = this.newScanner();

    this.set('scanner', scanner);

    this.addListeners();

    try {
      await this.getCameras();
      await this.startDefaultCamera();
    } catch(e) {
      this.onError(e);
    }
  }

  newScanner(): Scanner {
    const video = this.element.querySelector('#qr-preview');
    const scanner = new Scanner({ video, mirror: false, continuous: true });

    return scanner;
  }

  addListeners(this: QRScanner) {
    if (!this.scanner) return;

    this.scanner.addListener('scan', content => {
      this.scanner!.stop();

      this.onScan(content);
    });
  }

  async getCameras(this: QRScanner) {
    const cameras = await Camera.getCameras();

    if (cameras.length === 0) throw new NoCameraError();

    cameras.forEach(camera => camera.displayName = this.nameForCamera(camera.name));

    this.set('cameras', cameras);
  }

  async startDefaultCamera(this: QRScanner) {
    // get back camera or first available
    // laptops' cameras don't have names
   const backCamera = this.cameras.find(c => (!!c.name && c.name.toLowerCase().includes('back')));
   const defaultCamera = backCamera || this.cameras[0];

   this.set('activeCamera', defaultCamera);

   await this.scanner!.stop();
   await this.scanner!.start(defaultCamera);
  }

  nameForCamera(cameraName: string) {
    const name = cameraName.toLowerCase();
    const isFront = name.includes('front');
    const isBack = name.includes('back');

    if (isFront) return 'Front';
    if (isBack) return 'Back';

    return cameraName;
  }

  @action
  selectCamera(this: QRScanner, selectedCamera: Camera) {
    this.set('activeCamera', selectedCamera);
  }
}
