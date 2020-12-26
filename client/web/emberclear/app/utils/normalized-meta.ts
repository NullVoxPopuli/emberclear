import type { OpenGraphData } from '@emberclear/networking/types';

type Args = {
  url: string;
  openGraph?: OpenGraphData | null;
};

// https://stackoverflow.com/a/8260383/356849
const YT_PATTERN = /^.*(youtu.be\/|\/v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
const IMAGE_PATTERN = /(jpg|png|gif|webp)/;
const VIDEO_PATTERN = /(\.(mp4)$)/;
const EXT_PATTERN = /\.[\w]{2,4}$/;

export type NormalizedMeta = {
  alt?: string;
  title?: string;
  siteName?: string;
  description?: string;
  hasExtension: boolean;
  openGraph?: OpenGraphData | null;

  embedUrl?: string;
  isVideo: boolean;
  isImage: boolean;
  isYouTube: boolean;

  hasMedia: boolean;
  hasInfo: boolean;
};

export function normalizeMeta(data: Args): NormalizedMeta {
  let og = data.openGraph || {};

  let embedUrl = embedUrlFrom(data.url);

  let types = {
    isVideo: VIDEO_PATTERN.test(data.url),
    isImage: IMAGE_PATTERN.test(data.url),
    isYouTube: Boolean(embedUrl),
  };

  return {
    ...types,
    hasMedia: types.isVideo || types.isImage || types.isYouTube,
    hasInfo: Boolean(og.title || og.description),

    hasExtension: EXT_PATTERN.test(data.url),
    alt: og['image:alt'],
    title: og.title,
    siteName: og['site_name'],
    description: og.description,
    openGraph: og,

    embedUrl,
  };
}

function embedUrlFrom(url: string) {
  let ytMatches = url.match(YT_PATTERN);

  if (ytMatches?.[2]) {
    let videoId = ytMatches[2];
    let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;

    return embedUrl;
  }

  return undefined;
}
