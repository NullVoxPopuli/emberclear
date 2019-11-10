import DOMPurify from 'dompurify';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ChatScroller from 'emberclear/services/chat-scroller';

type Args = {
  ogData: OpenGraphData;
};

export default class MetadataPreview extends Component<Args> {
  @service chatScroller!: ChatScroller;

  get hasOgData() {
    return this.hasImage || this.title || this.description;
  }

  get hasImage() {
    return Boolean(this.args.ogData && this.args.ogData.image);
  }

  get title() {
    let { ogData } = this.args;

    if (!ogData) return '';

    return DOMPurify.sanitize(ogData.title || '');
  }

  get description() {
    let { ogData } = this.args;

    if (!ogData) return '';

    return DOMPurify.sanitize(ogData.description || '');
  }
}
