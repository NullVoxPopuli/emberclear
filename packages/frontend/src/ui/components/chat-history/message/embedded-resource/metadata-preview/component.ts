import Component from '@ember/component';
import { inject as service } from '@ember-decorators/service';
import { and, reads, notEmpty } from '@ember-decorators/object/computed';

import ChatScroller from 'emberclear/services/chat-scroller';

export default class MetadataPreview extends Component {
  @service chatScroller!: ChatScroller;

  @and('ogData.title', 'ogData.description') hasOgData!: boolean;
  @reads('ogData') og!: OpenGraphData;

  @notEmpty('og.image') hasImage!: boolean;

  didInsertElement() {
    this.chatScroller.maybeNudgeToBottom(this.element as HTMLElement);
  }
}
