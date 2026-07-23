import { type ContentItem } from '../content/types';

export type AppCategoryId = 'ready' | 'prototype' | 'webos-emulation';

export interface AppEntry extends ContentItem {
  kind?: 'apps';
  url?: string;
  iframeTitle?: string;
  badges?: string[];
  platforms?: string[];
  technologies?: string[];
  category?: AppCategoryId;
  description?: string;
}
