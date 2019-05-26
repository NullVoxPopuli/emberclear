import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import QrScanner from 'qr-scanner';
// import { NoCameraError } from 'emberclear/src/utils/errors';

interface IArgs {
  onScan: (qrContent: string) => void;
  onError: (error: Error) => void;
}

export default class QRScanner extends Component<IArgs> {
  scanner?: QrScanner = undefined;

  @tracked started = false;

  async destroy() {
    await this.unmountScanner();
  }

  async unmountScanner() {
    if (!this.scanner) return;

    this.scanner.stop();
    this.scanner._qrWorker && this.scanner._qrWorker.terminate();
  }

  @action async mountScanner(this: QRScanner) {
    const scanner = this.newScanner();

    this.scanner = scanner;

    await scanner.start();

    this.started = true;
  }

  newScanner(): QrScanner {
    const video = document.querySelector('#qr-preview')!;
    const scanner = new QrScanner(video, (result: string) => {
      scanner.stop();
      scanner._qrWorker.terminate();

      this.args.onScan(result);
    });

    return scanner;
  }
}
