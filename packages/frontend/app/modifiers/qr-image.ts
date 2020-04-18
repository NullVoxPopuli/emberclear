import Modifier from 'ember-modifier';
import { restartableTask } from 'ember-concurrency-decorators';

import { convertObjectToQRCodeDataURL } from 'emberclear/utils/string-encoding';
import { taskFor } from 'emberclear/utils/ember-concurrency';

type Args = {
  positional: [object];
  named: {};
};

export default class QRImageModifier extends Modifier<Args> {
  didReceiveArguments() {
    taskFor(this.dataToQR).perform();
  }

  @restartableTask
  *dataToQR() {
    let data = this.args.positional[0];

    let urlData = yield convertObjectToQRCodeDataURL(data || {});

    if (isImage(this.element)) {
      this.element.src = urlData;
    }
  }
}

function isImage(element?: Element | null): element is HTMLImageElement {
  return 'src' in (element || {});
}
