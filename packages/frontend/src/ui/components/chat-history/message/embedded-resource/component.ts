import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';

// https://stackoverflow.com/a/8260383/356849
const YT_PATTERN = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const IMAGE_PATTERN = /(jpg|png|gif)/;

export default class extends Component {
  url!: string;

  isYouTube = false;
  isImage = false;
  isCollapsed = false;
  embedUrl?: string;


  constructor() {
    super(...arguments);

    this.parseUrl();
  }


  parseUrl() {
    const url = this.url;

    let ytMatches = url.match(YT_PATTERN);

    if (ytMatches && ytMatches[2]) {
      this.set('isYouTube', true);
      const videoId = ytMatches[2]
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
