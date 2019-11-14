type Args = {
  url: string;
  openGraph?: OpenGraphData;
};

export type NormalizedMeta = {
  alt?: string;
  title?: string;
  siteName?: string;
  description?: string;
  hasExtension: boolean;
  openGraph?: OpenGraphData
};

export function normalizeMeta(data: Args): NormalizedMeta {
  let og = data.openGraph || {};

  return {
    hasExtension: /\.[\w]{2,4}$/.test(data.url),
    alt: og['image:alt'],
    title: og.title,
    siteName: og['site_name'],
    description: og.description,
    openGraph: og,
  };
}
