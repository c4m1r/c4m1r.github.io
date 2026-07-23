const siteBasePath = '/site/';

const withEncodedParam = (path: string, value: string) => `${path}/${encodeURIComponent(value)}`;

export const sitePathBuilders = {
  blog: (id: string) => withEncodedParam(`${siteBasePath}blog`, id),
  news: (id: string) => withEncodedParam(`${siteBasePath}news`, id),
  wiki: (slug: string) => withEncodedParam(`${siteBasePath}wiki`, slug),
  project: (id: string) => withEncodedParam(`${siteBasePath}projects`, id),
  galleryItem: (id: string) => withEncodedParam(`${siteBasePath}gallery`, id),
  app: (id: string) => withEncodedParam(`${siteBasePath}apps`, id),
};
