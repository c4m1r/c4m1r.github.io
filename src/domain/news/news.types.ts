import { BaseContentItem } from '../content/types';

export interface NewsItem extends BaseContentItem {
  kind: 'news';
  title_ru?: string;
  title_en?: string;
  date: string; // ISO Date String YYYY-MM-DD
  category: string;
}
