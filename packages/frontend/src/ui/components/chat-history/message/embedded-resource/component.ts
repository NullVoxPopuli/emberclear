import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import { or } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import RelayManager from 'emberclear/services/relay-manager';

// https://stackoverflow.com/a/8260383/356849
const YT_PATTERN = /^.*(youtu.be\/|\/v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const IMAGE_PATTERN = /(jpg|png|gif)/;

interface IArgs {
  url: string;
}

export default class EmbeddedResource extends Component<IArgs> {
  @service relayManager!: RelayManager;

  @tracked isYouTube = false;
  @tracked isImage = false;
  @tracked isCollapsed = false;
  @tracked embedUrl?: string;

  @tracked hasOgData!: boolean;
  @tracked ogData!: OpenGraphData;
  @tracked title?: string;
  @tracked siteName?: string;

  didInsertElement() {
    this.setup.perform();
  }

  @task(function*() {
    if (!this.args.url) return;

    this.parseUrl();
    this.fetchOpenGraph();
  })
  setup;

  @or('embedUrl', 'isImage', 'hasOgData') shouldRender!: boolean;

  async fetchOpenGraph(this: EmbeddedResource) {
    const og = await this.relayManager.getOpenGraph(this.args.url);

    this.hasOgData = !!og.title;
    this.ogData = og;
    this.title = og.title;
    this.siteName = og.site_name;
  }

  parseUrl() {
    const { url } = this.args;

    let ytMatches = url.match(YT_PATTERN);

    if (ytMatches && ytMatches[2]) {
      this.isYouTube = true;
      const videoId = ytMatches[2];
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

      this.embedUrl = embedUrl;
    } else if (url.match(IMAGE_PATTERN)) {
      this.isImage = true;
    }
  }

  toggleShow() {
    this.isCollapsed = !this.isCollapsed;
  }
}
