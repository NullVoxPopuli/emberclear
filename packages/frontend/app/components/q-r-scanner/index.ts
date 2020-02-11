import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import RouterService from '@ember/routing/router-service';
// import { NoCameraError } from 'emberclear/utils/errors';

interface IArgs {
  onScan: (qrContent: string) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

// TODO: should this be a modifier?
export default class QRScanner extends Component<IArgs> {
  @service router!: RouterService;

  @tracked cameraStream?: MediaStream;
  @tracked lastDetectedData?: string;

  get isCameraActive() {
    return this.cameraStream !== undefined;
  }

  @action
  async toggleCamera() {
    try {
      this.isCameraActive ? this.stop() : await this.start();
    } catch (e) {
      this.args.onError(e);
    }
  }

  @action
  handleData(data: string) {
    this.args.onScan(data);
  }

  @action
  async start() {
    let options = { video: { facingMode: 'environment' } };
    let stream = await navigator.mediaDevices.getUserMedia(options);

    this.cameraStream = stream;
  }

  private stop() {
    this.cameraStream?.getTracks().forEach(track => track.stop());
    this.cameraStream = undefined;
  }

  willDestroy() {
    this.stop();
    super.willDestroy();
  }
}
