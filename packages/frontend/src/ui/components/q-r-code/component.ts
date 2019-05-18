import Component from 'sparkles-component';
import { computed } from '@ember/object';
import { reads, not } from '@ember/object/computed';

import { convertObjectToQRCodeDataURL } from 'emberclear/src/utils/string-encoding';
import { monitor } from 'emberclear/src/utils/decorators';

interface IArgs {
  data: object;
  alt?: string;
}

export default class QRCode extends Component<IArgs> {
  @not('qrCode.isPending') isIdle!: boolean;
  @reads('qrCode.result') qrCodeData!: string;

  @computed
  @monitor
  get qrCode() {
    const { data } = this.args;

    return convertObjectToQRCodeDataURL(data || {});
  }
}
