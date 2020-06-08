import Modifier from 'ember-modifier';
import { restartableTask } from 'ember-concurrency-decorators';

import { convertObjectToQRCodeDataURL } from 'emberclear/utils/string-encoding';
import { taskFor } from 'ember-concurrency-ts';

type Args = {
  positional: [Record<string, unknown>];
  named: EmptyRecord;
};

export default class QRImageModifier extends Modifier<Args> {
  didReceiveArguments() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.dataToQR).perform();
  }

  @restartableTask
  async dataToQR() {
    let data = this.args.positional[0];

    let urlData = await convertObjectToQRCodeDataURL(data || {});

    if (isImage(this.element)) {
      this.element.src = urlData;
    }
  }
}

function isImage(element?: Element | null): element is HTMLImageElement {
  return 'src' in (element || {});
}
