import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { and, reads } from '@ember-decorators/object/computed';

import ChatScroller from 'emberclear/services/chat-scroller';

export default class MetadataPreview extends Component {
  @service chatScroller!: ChatScroller;

  @and('ogData.title', 'ogData.description') hasOgData!: boolean;
  @reads('ogData') og!: OpenGraphData;

  didInsertElement() {
    this.chatScroller.maybeNudgeToBottom(this.element as HTMLElement);
  }
}
