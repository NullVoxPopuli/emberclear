import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import QrScanner from 'qr-scanner';
import RouterService from '@ember/routing/router-service';
// import { NoCameraError } from 'emberclear/utils/errors';

interface IArgs {
  onScan: (qrContent: string) => void;
  onError: (error: Error) => void;
}

// TODO: should this be a modifier?
export default class QRScanner extends Component<IArgs> {
  @service router!: RouterService;

  scanner?: QrScanner = undefined;

  @tracked error?: string;
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
    try {
      await this.start();
    } catch (e) {
      if (typeof e === 'string') {
        this.error = e;
      } else {
        console.error(e);
        this.error = e.message || 'Unknown Error';
      }
    }
  }

  async start() {
    this.error = '';
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
