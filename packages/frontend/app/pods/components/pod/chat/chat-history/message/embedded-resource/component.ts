import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// https://stackoverflow.com/a/8260383/356849
const YT_PATTERN = /^.*(youtu.be\/|\/v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const IMAGE_PATTERN = /(jpg|png|gif)/;

interface IArgs {
  url: string;
  openGraph: OpenGraphData;
}

export default class EmbeddedResource extends Component<IArgs> {
  @tracked isCollapsed = false;

  @tracked title?: string;
  @tracked siteName?: string;

  get isYouTube() {
    return Boolean(this.embedUrl);
  }

  get isImage() {
    return IMAGE_PATTERN.test(this.args.url);
  }

  get embedUrl() {
    let ytMatches = this.args.url.match(YT_PATTERN);

    if (ytMatches && ytMatches[2]) {
      let videoId = ytMatches[2];
      let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

      return embedUrl;
    }

    return undefined;
  }

  @action toggleShow() {
    this.isCollapsed = !this.isCollapsed;
  }
}
