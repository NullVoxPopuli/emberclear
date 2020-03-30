import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

interface IArgs {
  onScan: (qrContent: string) => void;
}

export default class QRScanner extends Component<IArgs> {
  @service intl!: Intl;
  @service toast!: Toast;

  @tracked cameraStream?: MediaStream;
  @tracked lastDetectedData?: string;

  get isCameraActive() {
    return this.cameraStream !== undefined;
  }

  @action
  async toggleCamera() {
    this.isCameraActive ? this.stop() : await this.start();
  }

  @action
  handleData(data: string) {
    this.args.onScan(data);
  }

  @action
  async start() {
    let options = { video: { facingMode: 'environment' } };
    try {
      let stream = await navigator.mediaDevices.getUserMedia(options);

      this.cameraStream = stream;
    } catch (e) {
      let msg = this.intl.t('errors.permissions.enableCamera');

      this.toast.error(msg);
    }
  }

  private stop() {
    this.cameraStream?.getTracks().forEach((track) => track.stop());
    this.cameraStream = undefined;
  }

  willDestroy() {
    this.stop();
    super.willDestroy();
  }
}
