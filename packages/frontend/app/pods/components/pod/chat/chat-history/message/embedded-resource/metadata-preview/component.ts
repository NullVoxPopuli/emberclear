import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';

type Args = {
  ogData: OpenGraphData;
};

export default class MetadataPreview extends Component<Args> {
  @service chatScroller!: ChatScroller;

  get hasOgData() {
    let { ogData } = this.args;

    return ogData.title || ogData.description;
  }

  get hasImage() {
    return Boolean(this.args.ogData?.image);
  }
}
