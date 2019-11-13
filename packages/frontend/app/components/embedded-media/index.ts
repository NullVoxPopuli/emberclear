import Component from '@glimmer/component';

type Args = {
  url: string;
  meta: OpenGraphData; // maybe?
};

// https://stackoverflow.com/a/8260383/356849
const YT_PATTERN = /^.*(youtu.be\/|\/v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const IMAGE_PATTERN = /(jpg|png|gif)/;
const VIDEO_PATTERN = /(\.mp4$)/;

export default class EmbeddedMedia extends Component<Args> {
  get alt() {
    return this.args.meta['image:meta'];
  }

  get isYouTube() {
    return Boolean(this.embedUrl);
  }

  get isVideo() {
    return VIDEO_PATTERN.test(this.args.url);
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
}
