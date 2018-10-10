import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { or } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';

import RelayConnection from 'emberclear/services/relay-connection';
import RelayManager from 'emberclear/services/relay-manager';
import ChatScroller from 'emberclear/services/chat-scroller';

// https://stackoverflow.com/a/8260383/356849
const YT_PATTERN = /^.*(youtu.be\/|\/v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const IMAGE_PATTERN = /(jpg|png|gif)/;

export default class EmbeddedResource extends Component {
  @service relayConnection!: RelayConnection;
  @service relayManager!: RelayManager;
  @service chatScroller!: ChatScroller;

  url!: string;

  isYouTube = false;
  isImage = false;
  isCollapsed = false;
  embedUrl?: string;

  hasOgData!: boolean;
  ogData!: OpenGraphData;
  title?: string;
  siteName?: string;

  didInsertElement() {
    this.setup.perform();
  }


  @task * setup(this: EmbeddedResource) {
    this.parseUrl();
    this.fetchOpenGraph();
  }

  @or('embedUrl', 'isImage', 'hasOgData') shouldRender!: boolean;

  async fetchOpenGraph(this: EmbeddedResource) {
    const og = await this.relayManager.getOpenGraph(this.url);

    this.set('hasOgData', !!(og.title));
    this.set('ogData', og);
    this.set('title', og.title);
    this.set('siteName', og.site_name);

    this.chatScroller.maybeNudgeToBottom();
  }

  parseUrl() {
    const url = this.url;

    let ytMatches = url.match(YT_PATTERN);

    if (ytMatches && ytMatches[2]) {
      this.set('isYouTube', true);
      const videoId = ytMatches[2];
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

      this.set('embedUrl', embedUrl);
    } else if (url.match(IMAGE_PATTERN)) {
      this.set('isImage', true);
    }
  }

  @action
  toggleShow() {
    this.set('isCollapsed', !this.isCollapsed);
  }
}
