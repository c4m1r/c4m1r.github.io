export type ContentKind = 'news' | 'articles' | 'wiki' | 'projects' | 'resume' | 'about' | 'gallery' | 'apps';

export interface ContentVisibility {
  site?: boolean;
  os?: boolean;
  search?: boolean;
}

export interface ContentDisplay {
  icon?: string;
  preferredApp?: string;
  badge?: string;
}

export interface ContentRouteInfo {
  /** Deprecated alias retained for existing consumers while loaders migrate to sitePath. */
  path?: string;
  /** Browser canonical path for the site shell only. */
  sitePath?: string;
  /** Internal desktop/app pseudo URL only; never used as a browser route. */
  osUri?: string;
  /** Desktop appRegistry id used to open this content in an OS shell. */
  appId?: string;
}

export interface BaseContentItem {
  id: string;
  kind?: ContentKind;
  title: string;
  content: string;
  date?: string;
  category?: string;
  tags?: string[];
  author?: string;
  updatedAt?: string;
  relativePath?: string;
  pathSegments?: string[];
  preview?: string;
  
  visibility?: ContentVisibility;
  display?: ContentDisplay;
  route?: ContentRouteInfo;
  related?: string[];
}

export interface ContentItem extends BaseContentItem {}

export interface ContentRelation {
  sourceId: string;
  targetId: string;
  kind: string; // e.g., 'related', 'author', 'project_category', etc.
}

export interface ContentGraphNode {
  item: ContentItem;
  incoming: ContentRelation[];
  outgoing: ContentRelation[];
}

export interface ContentGraph {
  nodes: Map<string, ContentGraphNode>;
  byId: Map<string, ContentItem>;
  byKind: Map<ContentKind, ContentItem[]>;
  byTag: Map<string, ContentItem[]>;
  byCategory: Map<string, ContentItem[]>;
}

