import Component from '@ember/component';

import { action } from '@ember-decorators/object';

import * as Instascan from 'instascan';


// inspiration from previous work here:
// https://github.com/NullVoxPopuli/tanqueReact/blob/master/js/components/-components/qr-scanner/index.jsx
export default class QRScanner extends Component {
  cameras = [];
  scanner = null;
  activeCamera: string = '';

  didInsertElement() {
    this.mountScanner();
  }

  mountScanner() {
    const { onError } = this.props;
    const scanner = this.newScanner();

    this.setState({ scanner }, async () => {
      this.addListeners();

      try {
        await this.getCameras();
        await this.startDefaultCamera();
      } catch(e) {
        onError(e);
      }
    });

  }

  newScanner() {
    const scanner = new Instascan.Scanner({
      video: document.getElementById('preview'),
      mirror: false,
      continuous: true
    });

    return scanner;
  }

  addListeners() {
    const { onScan } = this.props;
    const { scanner } = this.state;

    scanner.addListener('scan', content => {
      scanner.stop();

      onScan(content);
    });
  }

  async getCameras() {
    const cameras = await Instascan.Camera.getCameras();

    if (cameras.length === 0) throw new NoCameraError();

    this.set('cameras', cameras);
  }

  async startDefaultCamera(this: QRScanner) {
   const backCamera = this.cameras.find(c => c.name.toLowerCase().includes('back'));
   const defaultCamera = backCamera || this.cameras[0];

   this.set('activeCamera', defaultCamera.name);

   await this.scanner.stop();
   await this.scanner.start(defaultCamera);
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
  selectCamera(selectedCamera: any) {

  }
}
