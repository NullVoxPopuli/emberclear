import Component from 'sparkles-component';
import { reads } from '@ember-decorators/object/computed';

import { convertObjectToQRCodeDataURL } from 'emberclear/src/utils/string-encoding';

import { keepLatestTask } from 'ember-concurrency-decorators';

interface IArgs {
  data: object;
  alt?: string;
}

export default class QRCode extends Component<IArgs> {
  @reads('qrCode.isIdle') isIdle!: boolean;
  @reads('qrCode.lastSuccessful.value') qrCodeData!: string;

  didInsertElement() {
    this.qrCode.perform();
  }

  didReceiveAttrs() {
    this.qrCode.perform();
  }

  @keepLatestTask * qrCode() {
    const { data } = this.args;
    const imageData = yield convertObjectToQRCodeDataURL(data || {});

    return imageData;
  }
}
