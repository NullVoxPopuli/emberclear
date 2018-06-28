import Component from '@ember/component';

import QrScanner from 'qr-scanner';
import { NoCameraError } from 'emberclear/src/utils/errors';

// inspiration from previous work here:
// https://github.com/NullVoxPopuli/tanqueReact/blob/master/js/components/-components/qr-scanner/index.jsx
export default class QRScanner extends Component {
  // args
  onScan!: (qrContent: string) => void;
  onError!: (error: Error) => void;

  scanner?: QrScanner = undefined;

  started = false;

  didInsertElement() {
    this.mountScanner();
  }

  willDestroyElement() {
    this.unmountScanner();
  }

  async unmountScanner(this: QRScanner) {
    if (!this.scanner) return;

    this.scanner.stop();
    this.scanner._qrWorker && this.scanner._qrWorker.terminate();
  }

  async mountScanner(this: QRScanner) {
    const scanner = this.newScanner();

    this.scanner = scanner;

    await scanner.start();

    this.set('started', true);
  }

  newScanner(): QrScanner {
    const video = this.element.querySelector('#qr-preview')!;
    const scanner = new QrScanner(video, (result: string) => {
      scanner.stop();
      scanner._qrWorker.terminate();

      this.onScan(result);
    });

    return scanner;
  }
}
