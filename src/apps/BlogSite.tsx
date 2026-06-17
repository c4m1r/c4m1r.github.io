import { useEffect, useMemo, useState } from 'react';
import {
  Grid3x3,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Filter,
  Search,
  Image as ImageIcon,
  Tag,
  User,
  FileText,
  Briefcase,
  Layers,
  Play,
  X,
  Scale,
  Folder,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  loadAppEntries,
  loadAboutMe,
  loadLegalNotice,
  type AppCategoryId,
  type AppEntry,
  type ContentItem,
  type ImageItem,
} from '../utils/contentLoader';
import { loadPictureItems } from '../domain/gallery/gallery.loader';
import { loadArticles } from '../domain/articles/articles.loader';
import { loadWikiArticles, loadWikiCategoryIndex } from '../domain/wiki/wiki.loader';
import { loadAllProjects } from '../domain/projects/projects.loader';
import { type Language } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import { stripMarkdown, markdownToHtml } from '../domain/content/markdown';
import { loadCvLocale } from '../domain/resume/resume.loader';
import { Navigation } from '../components/Navigation';
import { SectionCard } from '../components/SectionCard';
import { ContentCard } from '../components/ContentCard';
import { ContentReader } from '../components/ContentReader';
import { Footer } from '../components/Footer';
import { Hero } from '../components/Hero';
import { NewsSection } from '../shells/site/sections/NewsSection';
import { NewsPageSection } from '../shells/site/sections/NewsPageSection';
import { ProjectsSection } from '../shells/site/sections/ProjectsSection';
import { GallerySection } from '../shells/site/sections/GallerySection';
import { ArticlesSection } from '../shells/site/sections/ArticlesSection';
import { ArticleDetailSection } from '../shells/site/sections/ArticleDetailSection';
import { WikiSection } from '../shells/site/sections/WikiSection';
import { AboutSection } from '../shells/site/sections/AboutSection';
import { useProjects } from '../domain/projects/useProjects';
import { useGallery } from '../domain/gallery/useGallery';
import { useNews } from '../domain/news/useNews';
import { type NewsItem } from '../domain/news/news.types';
import { markdownToHtml as _markdownToHtml } from '../domain/content/markdown';

type Section = 'home' | 'about' | 'wiki' | 'cv' | 'gallery' | 'blog' | 'search' | 'project' | 'apps' | 'news';
type NavSection = 'home' | 'about' | 'wiki' | 'gallery' | 'blog' | 'search' | 'apps' | 'news';

interface BlogPostView extends ContentItem {
  excerpt: string;
  readingTime: string;
  html: string;
}

interface WikiView extends ContentItem {
  excerpt: string;
  html: string;
  categoryPath: string;
}

type SectionNav = 'home' | 'about' | 'wiki' | 'cv' | 'gallery' | 'blog' | 'search' | 'apps' | 'news';

type UiText = {
  nav: Record<SectionNav, string> & { legal: string };
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  categories: string;
  tags: string;
  loading: string;
  nothing: string;
  back: string;
  nowReading: string;
  galleryTitle: string;
  wikiTitle: string;
  cvTitle: string;
  aboutTitle: string;
  projectsTitle: string;
  sections: {
    explore: string;
    exploreSubtitle: string;
  };
  apps: {
    title: string;
    subtitle: string;
    selectPrompt: string;
    descriptionLabel: string;
    platformsLabel: string;
    technologiesLabel: string;
    badgesLabel: string;
    dateLabel: string;
    openFullLabel: string;
    categories: Record<AppCategoryId, string>;
  };
  latestPosts: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  cta: {
    letsCreate: string;
    together: string;
    description: string;
    getInTouch: string;
  };
  blog: {
    title: string;
    subtitle: string;
    description: string;
  };
  wiki: {
    description: string;
  };
  cv: {
    experience: string;
    education: string;
    prototypes: string;
    rewards: string;
    print: string;
    downloadPdf: string;
    viewDemo: string;
  };
  about: {
    description: string;
  };
  gallery: {
    description: string;
    allAlbums: string;
  };
  search: {
    title: string;
    subtitle: string;
    placeholder: string;
    allContent: string;
    results: string;
  };
  stats: {
    blogPosts: string;
    wikiArticles: string;
    galleryImages: string;
    projects: string;
  };
};

const basePath = '/site/';
const APP_CATEGORIES: AppCategoryId[] = ['ready', 'prototype', 'webos-emulation'];

const uiTexts: Record<Language, UiText> = {
  en: {
    nav: { home: 'Home', about: 'About', wiki: 'Wiki', cv: 'CV', gallery: 'Gallery', blog: 'Blog', apps: 'Apps', search: 'Search', news: 'News', legal: 'Legal Notice' },
    heroTitle: 'IT Engineer',
    heroSubtitle: 'Building beautiful digital experiences with code, creativity, and passion. Explore my work, thoughts, and knowledge base.',
    searchPlaceholder: 'Search articles...',
    categories: 'Categories',
    tags: 'Tags',
    loading: 'Loading...',
    nothing: 'Nothing found.',
    back: 'Back',
    nowReading: 'Reading now',
    galleryTitle: 'Gallery',
    wikiTitle: 'Wiki',
    cvTitle: 'CV (Р В Р’В Р вЂ™Р’В Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В·Р В Р Р‹Р В РІР‚в„–Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’Вµ:)',
    aboutTitle: 'About me',
    projectsTitle: 'Projects:',
    sections: {
      explore: 'Explore My World',
      exploreSubtitle: 'Dive into different aspects of my work and interests',
    },
    apps: {
      title: 'Apps',
      subtitle: 'Demonstration of my projects',
      selectPrompt: 'Select an app to load it in the center window.',
      descriptionLabel: 'Description',
      platformsLabel: 'Platforms',
      technologiesLabel: 'Technologies',
      badgesLabel: 'Tags',
      dateLabel: 'Date',
      openFullLabel: 'Open Full',
      categories: {
        ready: 'Ready applications',
        prototype: 'Prototype experiments',
        'webos-emulation': 'WebOS Emulation',
      },
    },
    latestPosts: {
      title: 'Latest Posts',
      subtitle: 'Fresh thoughts and insights',
      viewAll: 'View All',
    },
    cta: {
      letsCreate: "Let's",
      together: 'Create Together',
      description: 'Whether you have a project in mind or just want to connect, I\'d love to hear from you.',
      getInTouch: 'Get in Touch',
    },
    blog: {
      title: 'Blog',
      subtitle: 'Thoughts, tutorials, and insights on development, design, and technology.',
      description: 'Thoughts, tutorials, and insights on development, design, and technology.',
    },
    wiki: {
      description: 'A curated knowledge base of concepts, tools, and techniques I use daily.',
    },
    cv: {
      experience: 'Experience',
      education: 'Education',
      prototypes: 'Prototypes',
      rewards: 'Rewards',
      print: 'Print',
      downloadPdf: 'Download PDF',
      viewDemo: 'View Demo',
    },
    about: {
      description: 'Learn about my journey, skills, and what drives my passion for creating.',
    },
    gallery: {
      description: 'A visual journey through projects, photography, and creative explorations.',
      allAlbums: 'All Albums',
    },
    search: {
      title: 'Search',
      subtitle: 'Find anything across blog posts, wiki articles, and gallery',
      placeholder: 'Search across all content...',
      allContent: 'All Content',
      results: 'results',
    },
    stats: {
      blogPosts: 'Blog Posts',
      wikiArticles: 'Wiki Articles',
      galleryImages: 'Gallery Images',
      projects: 'Projects',
    },
  },
  ru: {
    nav: { home: 'Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В Р РЏ', about: 'Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋР’ВР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ', wiki: 'Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В', cv: 'Р В Р’В Р вЂ™Р’В Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В·Р В Р Р‹Р В РІР‚в„–Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’Вµ', gallery: 'Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В Р РЏ', blog: 'Р В Р’В Р Р†Р вЂљР’ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњ', apps: 'Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ', search: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚Сњ', news: 'Р В Р’В Р РЋРЎС™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В', legal: 'Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В Р РЏ Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ' },
    heroTitle: 'IT Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™',
    heroSubtitle: 'Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В·Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚в„– Р В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎвЂєР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р Р‹Р В РЎвЂњ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР’В°Р В Р Р‹Р В Р вЂ°Р В Р Р‹Р В РІР‚в„– Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°, Р В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚В Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В. Р В Р’В Р вЂ™Р’ВР В Р’В Р вЂ™Р’В·Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚В Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“, Р В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚В Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р Р‹Р РЋРІР‚Сљ Р В Р’В Р вЂ™Р’В·Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ.',
    searchPlaceholder: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚Сњ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°Р В Р Р‹Р В Р РЏР В Р’В Р РЋР’В...',
    categories: 'Р В Р’В Р РЋРІвЂћСћР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В',
    tags: 'Р В Р’В Р РЋРЎвЂєР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚В',
    loading: 'Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°...',
    nothing: 'Р В Р’В Р РЋРЎС™Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚Сћ Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ.',
    back: 'Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚В',
    nowReading: 'Р В Р’В Р вЂ™Р’В§Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚в„– Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњ',
    galleryTitle: 'Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В Р РЏ',
    wikiTitle: 'Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В',
    cvTitle: 'CV (Р В Р’В Р вЂ™Р’В Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В·Р В Р Р‹Р В РІР‚в„–Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’Вµ:)',
    aboutTitle: 'Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋР’ВР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ',
    projectsTitle: 'Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“:',
    sections: {
      explore: 'Р В Р’В Р вЂ™Р’ВР В Р Р‹Р В РЎвЂњР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™',
      exploreSubtitle: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р вЂ° Р В Р’В Р В РІР‚В  Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В ',
    },
    apps: {
      title: 'Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ',
      subtitle: 'Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР’В¦ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В ',
      selectPrompt: 'Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ, Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚Сћ Р В Р’В Р В РІР‚В  Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’Вµ.',
      descriptionLabel: 'Р В Р’В Р РЋРІР‚С”Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ',
      platformsLabel: 'Р В Р’В Р РЋРЎСџР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
      technologiesLabel: 'Р В Р’В Р РЋРЎвЂєР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В',
      badgesLabel: 'Р В Р’В Р РЋРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В',
      dateLabel: 'Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°',
      openFullLabel: 'Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°Р В Р Р‹Р В РІР‚в„–',
      categories: {
        ready: 'Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ',
        prototype: 'Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
        'webos-emulation': 'WebOS Р В Р’В Р вЂ™Р’В­Р В Р’В Р РЋР’ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ',
      },
    },
    latestPosts: {
      title: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
      subtitle: 'Р В Р’В Р В Р вЂ№Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В¶Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚В',
      viewAll: 'Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
    },
    cta: {
      letsCreate: 'Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ',
      together: 'Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В·Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’В Р В Р’В Р В РІР‚В Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ',
      description: 'Р В Р’В Р Р†Р вЂљРЎС›Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ў Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р В РЎвЂњР В Р’В Р В РІР‚В Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°Р В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р РЏ? Р В Р’В Р Р†Р вЂљР’ВР В Р Р‹Р РЋРІР‚СљР В Р’В Р СћРІР‚ВР В Р Р‹Р РЋРІР‚Сљ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚В Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ў Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњ.',
      getInTouch: 'Р В Р’В Р В Р вЂ№Р В Р’В Р В РІР‚В Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°Р В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р РЏ',
    },
    blog: {
      title: 'Р В Р’В Р Р†Р вЂљР’ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњ',
      subtitle: 'Р В Р’В Р РЋРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В, Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’Вµ, Р В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏР В Р Р‹Р Р†Р вЂљР’В¦.',
      description: 'Р В Р’В Р РЋРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В, Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’Вµ, Р В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏР В Р Р‹Р Р†Р вЂљР’В¦.',
    },
    wiki: {
      description: 'Р В Р’В Р РЋРІвЂћСћР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В Р РЏ Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В° Р В Р’В Р вЂ™Р’В·Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ, Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В  Р В Р’В Р РЋРІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚Сњ, Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р В Р РЏ Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚в„– Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ.',
    },
    cv: {
      experience: 'Р В Р’В Р РЋРІР‚С”Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ў',
      education: 'Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ',
      prototypes: 'Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
      rewards: 'Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
      print: 'Р В Р’В Р РЋРЎСџР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°',
      downloadPdf: 'Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° PDF',
      viewDemo: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚Сћ',
    },
    about: {
      description: 'Р В Р’В Р В РІвЂљВ¬Р В Р’В Р вЂ™Р’В·Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В, Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В¦ Р В Р’В Р РЋРІР‚В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’В, Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚Сћ Р В Р’В Р СћРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ў Р В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°Р В Р Р‹Р В РІР‚в„– Р В Р’В Р РЋРІР‚Сњ Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚в„–.',
    },
    gallery: {
      description: 'Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В· Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“, Р В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚в„– Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ.',
      allAlbums: 'Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’Вµ Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
    },
    search: {
      title: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚Сњ',
      subtitle: 'Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ Р В Р’В Р В РІР‚В  Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р вЂ™Р’Вµ, Р В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚вЂњР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’Вµ',
      placeholder: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚Сњ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚Сћ Р В Р’В Р В РІР‚В Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’ВР В Р Р‹Р РЋРІР‚Сљ Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚Сљ...',
      allContent: 'Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ў',
      results: 'Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В·Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В ',
    },
    stats: {
      blogPosts: 'Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р вЂ™Р’В°',
      wikiArticles: 'Р В Р’В Р В Р вЂ№Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°Р В Р’В Р РЋРІР‚В Р В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В',
      galleryImages: 'Р В Р’В Р вЂ™Р’ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ',
      projects: 'Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“',
    },
  },
  fr: {
    nav: { home: 'Accueil', about: 'Р В РІР‚СљР В РІР‚С™ propos', wiki: 'Wiki', cv: 'CV', gallery: 'Galerie', blog: 'Blog', apps: 'Applications', search: 'Recherche', news: 'ActualitР В РІР‚СљР вЂ™Р’В©s', legal: 'Mentions lР В РІР‚СљР вЂ™Р’В©gales' },
    heroTitle: 'DР В РІР‚СљР вЂ™Р’В©veloppeur crР В РІР‚СљР вЂ™Р’В©atif',
    heroSubtitle: 'CrР В РІР‚СљР вЂ™Р’В©er de belles expР В РІР‚СљР вЂ™Р’В©riences numР В РІР‚СљР вЂ™Р’В©riques avec code, crР В РІР‚СљР вЂ™Р’В©ativitР В РІР‚СљР вЂ™Р’В© et passion. Explorez mon travail, mes pensР В РІР‚СљР вЂ™Р’В©es et ma base de connaissances.',
    searchPlaceholder: 'Rechercher...',
    categories: 'CatР В РІР‚СљР вЂ™Р’В©gories',
    tags: 'Tags',
    loading: 'Chargement...',
    nothing: 'Rien trouvР В РІР‚СљР вЂ™Р’В©.',
    back: 'Retour',
    nowReading: 'En lecture',
    galleryTitle: 'Galerie',
    wikiTitle: 'Wiki',
    cvTitle: 'CV (RР В РІР‚СљР вЂ™Р’В©sumР В РІР‚СљР вЂ™Р’В©:)',
    aboutTitle: 'Р В РІР‚СљР В РІР‚С™ propos',
    projectsTitle: 'Projets:',
    sections: { explore: 'Explorez mon monde', exploreSubtitle: 'Plongez dans diffР В РІР‚СљР вЂ™Р’В©rents aspects de mon travail et de mes intР В РІР‚СљР вЂ™Р’В©rР В РІР‚СљР В РІР‚С›ts' },
    apps: {
      title: 'Applications',
      subtitle: 'DР В РІР‚СљР вЂ™Р’В©monstration de mes projets',
      selectPrompt: 'Choisissez une application pour l\'ouvrir au centre.',
      descriptionLabel: 'Description',
      platformsLabel: 'Plateformes',
      technologiesLabel: 'Technologies',
      badgesLabel: 'Р В РІР‚СљР Р†Р вЂљР’В°tiquettes',
      dateLabel: 'Date',
      openFullLabel: 'Ouvrir complet',
      categories: {
        ready: 'Applications prР В РІР‚СљР В РІР‚С›tes',
        prototype: 'Prototypes',
        'webos-emulation': 'Р В РІР‚СљР Р†Р вЂљР’В°mulation WebOS',
      },
    },
    latestPosts: { title: 'Derniers articles', subtitle: 'Nouvelles pensР В РІР‚СљР вЂ™Р’В©es et idР В РІР‚СљР вЂ™Р’В©es', viewAll: 'Voir tout' },
    cta: { letsCreate: 'CrР В РІР‚СљР вЂ™Р’В©ons', together: 'Ensemble', description: 'Que vous ayez un projet en tР В РІР‚СљР В РІР‚С›te ou que vous souhaitiez simplement vous connecter, j\'aimerais vous entendre.', getInTouch: 'Contactez-moi' },
    blog: { title: 'Blog', subtitle: 'PensР В РІР‚СљР вЂ™Р’В©es, tutoriels et idР В РІР‚СљР вЂ™Р’В©es sur le dР В РІР‚СљР вЂ™Р’В©veloppement, le design et la technologie.', description: 'PensР В РІР‚СљР вЂ™Р’В©es, tutoriels et idР В РІР‚СљР вЂ™Р’В©es sur le dР В РІР‚СљР вЂ™Р’В©veloppement, le design et la technologie.' },
    wiki: { description: 'Une base de connaissances organisР В РІР‚СљР вЂ™Р’В©e de concepts, d\'outils et de techniques que j\'utilise quotidiennement.' },
    cv: { experience: 'ExpР В РІР‚СљР вЂ™Р’В©rience', education: 'Р В РІР‚СљР Р†Р вЂљР’В°ducation', prototypes: 'Prototypes', rewards: 'RР В РІР‚СљР вЂ™Р’В©compenses', print: 'Imprimer', downloadPdf: 'TР В РІР‚СљР вЂ™Р’В©lР В РІР‚СљР вЂ™Р’В©charger PDF', viewDemo: 'Voir la dР В РІР‚СљР вЂ™Р’В©mo' },
    about: { description: 'DР В РІР‚СљР вЂ™Р’В©couvrez mon parcours, mes compР В РІР‚СљР вЂ™Р’В©tences et ce qui alimente ma passion pour la crР В РІР‚СљР вЂ™Р’В©ation.' },
    gallery: { description: 'Un voyage visuel Р В РІР‚СљР вЂ™Р’В  travers des projets, de la photographie et des explorations crР В РІР‚СљР вЂ™Р’В©atives.', allAlbums: 'Tous les albums' },
    search: { title: 'Recherche', subtitle: 'Trouvez n\'importe quoi dans les articles de blog, les articles wiki et la galerie', placeholder: 'Rechercher dans tout le contenu...', allContent: 'Tout le contenu', results: 'rР В РІР‚СљР вЂ™Р’В©sultats' },
    stats: { blogPosts: 'Articles de blog', wikiArticles: 'Articles wiki', galleryImages: 'Images', projects: 'Projets' },
  },
  es: {
    nav: { home: 'Inicio', about: 'Sobre mР В РІР‚СљР вЂ™Р’В­', wiki: 'Wiki', cv: 'CV', gallery: 'GalerР В РІР‚СљР вЂ™Р’В­a', blog: 'Blog', apps: 'Aplicaciones', search: 'Buscar', news: 'Noticias', legal: 'Aviso legal' },
    heroTitle: 'Desarrollador creativo',
    heroSubtitle: 'Construyendo hermosas experiencias digitales con cР В РІР‚СљР РЋРІР‚вЂњdigo, creatividad y pasiР В РІР‚СљР РЋРІР‚вЂњn. Explora mi trabajo, pensamientos y base de conocimientos.',
    searchPlaceholder: 'Buscar...',
    categories: 'CategorР В РІР‚СљР вЂ™Р’В­as',
    tags: 'Etiquetas',
    loading: 'Cargando...',
    nothing: 'Nada encontrado.',
    back: 'AtrР В РІР‚СљР В Р вЂ№s',
    nowReading: 'Leyendo',
    galleryTitle: 'GalerР В РІР‚СљР вЂ™Р’В­a',
    wikiTitle: 'Wiki',
    cvTitle: 'CV (CurrР В РІР‚СљР вЂ™Р’В­culum:)',
    aboutTitle: 'Sobre mР В РІР‚СљР вЂ™Р’В­',
    projectsTitle: 'Proyectos:',
    sections: { explore: 'Explora mi mundo', exploreSubtitle: 'SumР В РІР‚СљР вЂ™Р’В©rgete en diferentes aspectos de mi trabajo e intereses' },
    apps: {
      title: 'Aplicaciones',
      subtitle: 'DemostraciР В РІР‚СљР РЋРІР‚вЂњn de mis proyectos',
      selectPrompt: 'Selecciona una aplicaciР В РІР‚СљР РЋРІР‚вЂњn para verla en el centro.',
      descriptionLabel: 'DescripciР В РІР‚СљР РЋРІР‚вЂњn',
      platformsLabel: 'Plataformas',
      technologiesLabel: 'TecnologР В РІР‚СљР вЂ™Р’В­as',
      badgesLabel: 'Etiquetas',
      dateLabel: 'Fecha',
      openFullLabel: 'Abrir completo',
      categories: {
        ready: 'Aplicaciones listas',
        prototype: 'Prototipos',
        'webos-emulation': 'EmulaciР В РІР‚СљР РЋРІР‚вЂњn WebOS',
      },
    },
    latestPosts: { title: 'Р В РІР‚СљР РЋРІвЂћСћltimas publicaciones', subtitle: 'Pensamientos e ideas frescas', viewAll: 'Ver todo' },
    cta: { letsCreate: 'Vamos a', together: 'Crear juntos', description: 'Ya sea que tengas un proyecto en mente o simplemente quieras conectarte, me encantarР В РІР‚СљР вЂ™Р’В­a saber de ti.', getInTouch: 'Ponte en contacto' },
    blog: { title: 'Blog', subtitle: 'Pensamientos, tutoriales e ideas sobre desarrollo, diseР В РІР‚СљР вЂ™Р’В±o y tecnologР В РІР‚СљР вЂ™Р’В­a.', description: 'Pensamientos, tutoriales e ideas sobre desarrollo, diseР В РІР‚СљР вЂ™Р’В±o y tecnologР В РІР‚СљР вЂ™Р’В­a.' },
    wiki: { description: 'Una base de conocimientos curada de conceptos, herramientas y tР В РІР‚СљР вЂ™Р’В©cnicas que uso a diario.' },
    cv: { experience: 'Experiencia', education: 'EducaciР В РІР‚СљР РЋРІР‚вЂњn', prototypes: 'Prototipos', rewards: 'Premios', print: 'Imprimir', downloadPdf: 'Descargar PDF', viewDemo: 'Ver demo' },
    about: { description: 'Conoce mi trayectoria, habilidades y lo que impulsa mi pasiР В РІР‚СљР РЋРІР‚вЂњn por crear.' },
    gallery: { description: 'Un viaje visual a travР В РІР‚СљР вЂ™Р’В©s de proyectos, fotografР В РІР‚СљР вЂ™Р’В­a y exploraciones creativas.', allAlbums: 'Todos los Р В РІР‚СљР В Р вЂ№lbumes' },
    search: { title: 'Buscar', subtitle: 'Encuentra cualquier cosa en publicaciones de blog, artР В РІР‚СљР вЂ™Р’В­culos wiki y galerР В РІР‚СљР вЂ™Р’В­a', placeholder: 'Buscar en todo el contenido...', allContent: 'Todo el contenido', results: 'resultados' },
    stats: { blogPosts: 'Publicaciones', wikiArticles: 'ArtР В РІР‚СљР вЂ™Р’В­culos wiki', galleryImages: 'ImР В РІР‚СљР В Р вЂ№genes', projects: 'Proyectos' },
  },
  zh: {
    nav: { home: 'Р В РІвЂћвЂ“Р вЂ™Р’В¦Р Р†Р вЂљРІР‚СљР В РІвЂћвЂ“Р В Р вЂ№Р вЂ™Р’Вµ', about: 'Р В Р’ВµР Р†Р вЂљР’В¦Р РЋРІР‚вЂњР В РўвЂР РЋРІР‚СњР В РІР‚в„–', wiki: 'Р В Р’В·Р вЂ™Р’В»Р СћРІР‚ВР В Р’ВµР РЋРЎСџР РЋРІР‚Сњ', cv: 'Р В Р’В·Р вЂ™Р’В®Р В РІР‚С™Р В Р’ВµР В РІР‚в„–Р Р†Р вЂљР’В ', gallery: 'Р В Р’В·Р Р†Р вЂљРЎСљР вЂ™Р’В»Р В Р’ВµР вЂ™Р’В»Р В РІР‚В°', blog: 'Р В Р’ВµР В Р Р‰Р РЋРІвЂћСћР В Р’ВµР вЂ™Р’В®Р РЋРЎвЂє', apps: 'Р В Р’ВµР РЋРІР‚СњР Р†Р вЂљРЎСљР В Р’В·Р Р†Р вЂљРЎСљР В Р С“', search: 'Р В Р’В¶Р РЋРІР‚в„ўР РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє', news: 'Р В Р’В¶Р Р†Р вЂљРІР‚СљР вЂ™Р’В°Р В РІвЂћвЂ“Р Р†Р вЂљРІР‚СњР вЂ™Р’В»', legal: 'Р В Р’В¶Р РЋРІР‚вЂњР Р†Р вЂљРЎС›Р В Р’ВµР РЋРІР‚СћР Р†Р вЂљРІвЂћвЂ“Р В Р’ВµР В РІвЂљВ¬Р вЂ™Р’В°Р В Р’В¶Р вЂ™Р’ВР В РІР‚в„–' },
    heroTitle: 'Р В Р’ВµР Р†РІР‚С™Р’В¬Р Р†Р вЂљРЎвЂќР В Р’В¶Р Р†Р вЂљРЎвЂєР В Р РЏР В Р’ВµР РЋР’ВР В РІР‚С™Р В Р’ВµР В Р РЏР Р†Р вЂљР’ВР В РЎвЂР В РІР‚С™Р Р†Р вЂљР’В¦',
    heroSubtitle: 'Р В Р’В·Р Р†Р вЂљРЎСљР В Р С“Р В РўвЂР вЂ™Р’В»Р В РІвЂљВ¬Р В Р’В·Р вЂ™Р’В Р В РЎвЂњР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’ВµР Р†РІР‚С™Р’В¬Р Р†Р вЂљРЎвЂќР В Р’В¶Р Р†Р вЂљРЎвЂєР В Р РЏР В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’В·Р РЋРІР‚СљР вЂ™Р’В­Р В Р’В¶Р РЋРІР‚СљР Р†Р вЂљР’В¦Р В Р’В¶Р РЋРІР‚С”Р Р†Р вЂљРЎвЂєР В Р’ВµР вЂ™Р’В»Р РЋРІР‚СњР В Р’В·Р РЋРІР‚СћР В РІР‚в„–Р В РўвЂР РЋРІР‚ВР В РІР‚В¦Р В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’В¶Р Р†Р вЂљРЎС›Р вЂ™Р’В°Р В Р’ВµР вЂ™Р’В­Р Р†Р вЂљРІР‚СњР В РўвЂР В РІР‚В¦Р Р†Р вЂљРЎС™Р В РІвЂћвЂ“Р В РІР‚С›Р В Р вЂ°Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ўР В Р’В¶Р В РІР‚в„–Р РЋРЎвЂєР В Р’В·Р СћРІР‚ВР РЋРЎвЂєР В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В РўвЂР В РІР‚В¦Р РЋРЎв„ўР В Р’ВµР Р†Р вЂљРЎС™Р В РЎвЂњР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р В РІР‚С™Р РЋРЎС™Р В Р’В¶Р РЋРІР‚СљР РЋРІР‚вЂњР В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’В·Р РЋРЎСџР СћРЎвЂ™Р В РЎвЂР В РІР‚РЋР Р†Р вЂљР’В Р В Р’ВµР РЋРІР‚СњР Р†Р вЂљРЎС™Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў',
    searchPlaceholder: 'Р В Р’В¶Р РЋРІР‚в„ўР РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє...',
    categories: 'Р В Р’ВµР Р†РІР‚С™Р’В¬Р Р†Р вЂљР’В Р В Р’В·Р вЂ™Р’В±Р вЂ™Р’В»',
    tags: 'Р В Р’В¶Р вЂ™Р’В Р Р†Р вЂљР Р‹Р В Р’В·Р вЂ™Р’В­Р РЋРІР‚Сћ',
    loading: 'Р В Р’ВµР В РІР‚В°Р вЂ™Р’В Р В РЎвЂР В РІР‚В¦Р В РІР‚В¦Р В РўвЂР РЋРІР‚ВР вЂ™Р’В­...',
    nothing: 'Р В Р’В¶Р РЋРЎв„ўР В РІР‚С›Р В Р’В¶Р Р†Р вЂљР’В°Р РЋРІР‚СћР В Р’ВµР Р†РІР‚С™Р’В¬Р вЂ™Р’В°Р В Р’ВµР Р†Р вЂљР’В Р Р†Р вЂљР’В¦Р В Р’ВµР вЂ™Р’В®Р Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў',
    back: 'Р В РЎвЂР РЋРІР‚вЂќР Р†Р вЂљРЎСљР В Р’ВµР Р†Р вЂљРЎвЂќР РЋРІР‚С”',
    nowReading: 'Р В Р’В¶Р вЂ™Р’В­Р В РІвЂљВ¬Р В Р’ВµР РЋРЎв„ўР В Р С“Р В РІвЂћвЂ“Р вЂ™Р’ВР Р†Р вЂљР’В¦Р В РЎвЂР В РІР‚РЋР вЂ™Р’В»',
    galleryTitle: 'Р В Р’В·Р Р†Р вЂљРЎСљР вЂ™Р’В»Р В Р’ВµР вЂ™Р’В»Р В РІР‚В°',
    wikiTitle: 'Р В Р’В·Р вЂ™Р’В»Р СћРІР‚ВР В Р’ВµР РЋРЎСџР РЋРІР‚Сњ',
    cvTitle: 'CV (Р В Р’В·Р вЂ™Р’В®Р В РІР‚С™Р В Р’ВµР В РІР‚в„–Р Р†Р вЂљР’В :)',
    aboutTitle: 'Р В Р’ВµР Р†Р вЂљР’В¦Р РЋРІР‚вЂњР В РўвЂР РЋРІР‚СњР В РІР‚в„–',
    projectsTitle: 'Р В РІвЂћвЂ“Р В Р вЂ№Р Р†РІР‚С›РІР‚вЂњР В Р’В·Р Р†Р вЂљРЎвЂќР вЂ™Р’В®Р В РЎвЂ”Р РЋР’ВР РЋРІвЂћСћ',
    sections: { explore: 'Р В Р’В¶Р В РІР‚в„–Р РЋРЎвЂєР В Р’В·Р СћРІР‚ВР РЋРЎвЂєР В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В РўвЂР РЋРІР‚ВР Р†Р вЂљРІР‚СљР В Р’В·Р Р†Р вЂљРЎС›Р В Р вЂ°', exploreSubtitle: 'Р В Р’В¶Р вЂ™Р’В·Р вЂ™Р’В±Р В Р’ВµР Р†Р вЂљР’В¦Р СћРЎвЂ™Р В РўвЂР РЋРІР‚СњР Р†Р вЂљР’В Р В РЎвЂР вЂ™Р’В§Р В РІвЂљВ¬Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’ВµР вЂ™Р’В·Р СћРЎвЂ™Р В РўвЂР В РІР‚В¦Р РЋРЎв„ўР В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’ВµР Р†Р вЂљР’В¦Р СћРІР‚ВР В РЎвЂР вЂ™Р’В¶Р В РІвЂљВ¬Р В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В РўвЂР РЋРІР‚ВР В Р Р‰Р В Р’ВµР РЋРІР‚в„ўР В Р вЂ°Р В Р’В¶Р Р†Р вЂљРІР‚СљР Р†РІР‚С›РІР‚вЂњР В РІвЂћвЂ“Р РЋРЎС™Р РЋРЎвЂє' },
    apps: {
      title: 'Р В Р’ВµР РЋРІР‚СњР Р†Р вЂљРЎСљР В Р’В·Р Р†Р вЂљРЎСљР В Р С“',
      subtitle: 'Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В РІвЂћвЂ“Р В Р вЂ№Р Р†РІР‚С›РІР‚вЂњР В Р’В·Р Р†Р вЂљРЎвЂќР вЂ™Р’В®Р В Р’В¶Р РЋР’ВР Р†Р вЂљРЎСљР В Р’В·Р вЂ™Р’В¤Р РЋРІР‚Сњ',
      selectPrompt: 'Р В РІвЂћвЂ“Р В РІР‚С™Р Р†Р вЂљР’В°Р В Р’В¶Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В©Р В РўвЂР РЋРІР‚ВР В РІР‚С™Р В РўвЂР РЋРІР‚ВР В РІР‚С›Р В Р’ВµР РЋРІР‚СњР Р†Р вЂљРЎСљР В Р’В·Р Р†Р вЂљРЎСљР В Р С“Р В РЎвЂ”Р РЋР’ВР В Р вЂ°Р В Р’ВµР РЋРЎв„ўР В Р С“Р В РўвЂР РЋРІР‚ВР вЂ™Р’В­Р В Р’ВµР вЂ™Р’В¤Р вЂ™Р’В®Р В Р’В·Р В РІР‚С›Р Р†Р вЂљРІР‚СњР В Р’ВµР В Р РЏР В РІвЂљВ¬Р В Р’В¶Р Р†Р вЂљР’В°Р Р†Р вЂљРЎС™Р В Р’ВµР РЋР’ВР В РІР‚С™Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў',
      descriptionLabel: 'Р В РЎвЂР В РІР‚РЋР СћРІР‚ВР В Р’В¶Р вЂ™Р’ВР В РІР‚в„–',
      platformsLabel: 'Р В Р’ВµР Р†РІР‚С›РІР‚вЂњР РЋРІР‚вЂњР В Р’ВµР В Р РЏР вЂ™Р’В°',
      technologiesLabel: 'Р В Р’В¶Р В РІР‚В°Р В РІР‚С™Р В Р’В¶Р РЋРЎв„ўР В РІР‚РЋ',
      badgesLabel: 'Р В Р’В¶Р вЂ™Р’В Р Р†Р вЂљР Р‹Р В Р’В·Р вЂ™Р’В­Р РЋРІР‚Сћ',
      dateLabel: 'Р В Р’В¶Р Р†Р вЂљРІР‚СњР СћРЎвЂ™Р В Р’В¶Р РЋРЎв„ўР РЋРЎСџ',
      openFullLabel: 'Р В Р’ВµР вЂ™Р’В®Р В Р вЂ°Р В Р’В¶Р Р†Р вЂљРЎС›Р СћРІР‚ВР В Р’В¶Р Р†Р вЂљР’В°Р Р†Р вЂљРЎС™Р В Р’ВµР РЋР’ВР В РІР‚С™',
      categories: {
        ready: 'Р В Р’В·Р В РІР‚в„–Р вЂ™Р’В°Р В Р’В¶Р Р†РІР‚С™Р’В¬Р РЋРІР‚в„ўР В Р’ВµР РЋРІР‚СњР Р†Р вЂљРЎСљР В Р’В·Р Р†Р вЂљРЎСљР В Р С“',
        prototype: 'Р В Р’ВµР В РІР‚в„–Р РЋРЎСџР В Р’ВµР РЋРІР‚С”Р Р†Р вЂљРІвЂћвЂ“',
        'webos-emulation': 'WebOSР В Р’В¶Р В Р С“Р В Р вЂ№Р В Р’В¶Р Р†Р вЂљРІвЂћвЂ“Р РЋРЎСџ',
      },
    },
    latestPosts: { title: 'Р В Р’В¶Р РЋРЎв„ўР В РІР‚С™Р В Р’В¶Р Р†Р вЂљРІР‚СљР вЂ™Р’В°Р В Р’В¶Р Р†Р вЂљРІР‚СљР Р†Р вЂљР Р‹Р В Р’В·Р вЂ™Р’В«Р вЂ™Р’В ', subtitle: 'Р В Р’В¶Р Р†Р вЂљРІР‚СљР вЂ™Р’В°Р В РІвЂћвЂ“Р В РІР‚В Р РЋРЎв„ўР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’В¶Р РЋРІР‚СљР РЋРІР‚вЂњР В Р’В¶Р РЋРІР‚вЂњР Р†Р вЂљРЎС›Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В РЎвЂР вЂ™Р’В§Р В РЎвЂњР В РЎвЂР вЂ™Р’В§Р В РІвЂљВ¬', viewAll: 'Р В Р’В¶Р РЋРЎСџР СћРЎвЂ™Р В Р’В·Р РЋРЎв„ўР Р†Р вЂљРІвЂћвЂ“Р В Р’ВµР Р†Р вЂљР’В¦Р В Р С“Р В РІвЂћвЂ“Р РЋРІР‚СљР В Р С“' },
    cta: { letsCreate: 'Р В РЎвЂР вЂ™Р’В®Р вЂ™Р’В©Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В РўвЂР вЂ™Р’В»Р вЂ™Р’В¬', together: 'Р В РўвЂР РЋРІР‚ВР В РІР‚С™Р В РЎвЂР вЂ™Р’ВµР вЂ™Р’В·Р В Р’ВµР Р†РІР‚С™Р’В¬Р Р†Р вЂљРЎвЂќР В РІвЂћвЂ“Р В РІР‚С™Р вЂ™Р’В ', description: 'Р В Р’В¶Р Р†Р вЂљРІР‚СњР вЂ™Р’В Р В РЎвЂР вЂ™Р’В®Р РЋРІР‚СњР В Р’В¶Р Р†Р вЂљРЎв„ўР В Р С“Р В Р’В¶Р РЋРЎв„ўР Р†Р вЂљР’В°Р В РІвЂћвЂ“Р В Р вЂ№Р Р†РІР‚С›РІР‚вЂњР В Р’В·Р Р†Р вЂљРЎвЂќР вЂ™Р’В®Р В Р’В¶Р РЋРІР‚СљР РЋРІР‚вЂњР В Р’В¶Р РЋРІР‚вЂњР Р†Р вЂљРЎС›Р В РЎвЂР РЋРІР‚вЂќР вЂ™Р’ВР В Р’В¶Р вЂ™Р’ВР В РІР‚РЋР В Р’ВµР В Р РЏР В РІР‚С›Р В Р’В¶Р вЂ™Р’ВР В РІР‚РЋР В Р’В¶Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂР В РЎвЂњР Р†Р вЂљРЎСљР В Р’В·Р РЋРІР‚вЂњР вЂ™Р’В»Р В РЎвЂ”Р РЋР’ВР В Р вЂ°Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В РІвЂћвЂ“Р РЋРІР‚СљР В РІР‚В¦Р В Р’ВµР РЋРІР‚СћР Р†РІР‚С™Р’В¬Р В РўвЂР Р†РІР‚С›РІР‚вЂњР РЋРІР‚в„ўР В Р’В¶Р Р†Р вЂљРЎвЂєР В Р РЏР В Р’ВµР РЋРІР‚в„ўР вЂ™Р’В¬Р В Р’ВµР Р†РІР‚С™Р’В¬Р вЂ™Р’В°Р В Р’В¶Р Р†Р вЂљРЎв„ўР В Р С“Р В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’ВµР В РІвЂљВ¬Р вЂ™Р’В°Р В РІвЂћвЂ“Р РЋРЎСџР РЋРІР‚вЂњР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў', getInTouch: 'Р В РЎвЂР В РЎвЂњР Р†Р вЂљРЎСљР В Р’В·Р РЋРІР‚вЂњР вЂ™Р’В»Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’В' },
    blog: { title: 'Р В Р’ВµР В Р Р‰Р РЋРІвЂћСћР В Р’ВµР вЂ™Р’В®Р РЋРЎвЂє', subtitle: 'Р В Р’ВµР Р†Р вЂљР’В¦Р РЋРІР‚вЂњР В РўвЂР РЋРІР‚СњР В РІР‚в„–Р В Р’ВµР РЋР’ВР В РІР‚С™Р В Р’ВµР В Р РЏР Р†Р вЂљР’ВР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂР вЂ™Р’В®Р РЋРІР‚СћР В РЎвЂР вЂ™Р’В®Р В Р вЂ№Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’В¶Р В РІР‚В°Р В РІР‚С™Р В Р’В¶Р РЋРЎв„ўР В РІР‚РЋР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’В¶Р РЋРІР‚СљР РЋРІР‚вЂњР В Р’В¶Р РЋРІР‚вЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р Р†Р вЂљРЎС›Р Р†РІР‚С›РЎС›Р В Р’В·Р В Р С“Р Р†Р вЂљРІвЂћвЂ“Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В РЎвЂР вЂ™Р’В§Р В РЎвЂњР В РЎвЂР вЂ™Р’В§Р В РІвЂљВ¬Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў', description: 'Р В Р’ВµР Р†Р вЂљР’В¦Р РЋРІР‚вЂњР В РўвЂР РЋРІР‚СњР В РІР‚в„–Р В Р’ВµР РЋР’ВР В РІР‚С™Р В Р’ВµР В Р РЏР Р†Р вЂљР’ВР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂР вЂ™Р’В®Р РЋРІР‚СћР В РЎвЂР вЂ™Р’В®Р В Р вЂ№Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’В¶Р В РІР‚В°Р В РІР‚С™Р В Р’В¶Р РЋРЎв„ўР В РІР‚РЋР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’В¶Р РЋРІР‚СљР РЋРІР‚вЂњР В Р’В¶Р РЋРІР‚вЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р Р†Р вЂљРЎС›Р Р†РІР‚С›РЎС›Р В Р’В·Р В Р С“Р Р†Р вЂљРІвЂћвЂ“Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В РЎвЂР вЂ™Р’В§Р В РЎвЂњР В РЎвЂР вЂ™Р’В§Р В РІвЂљВ¬Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў' },
    wiki: { description: 'Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В Р’В¶Р В РІР‚РЋР В Р РЏР В Р’ВµР вЂ™Р’В¤Р вЂ™Р’В©Р В РўвЂР В РІР‚В¦Р РЋРІР‚вЂќР В Р’В·Р Р†Р вЂљРЎСљР В Р С“Р В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’В¶Р вЂ™Р’В¦Р Р†Р вЂљРЎв„ўР В Р’ВµР РЋРІР‚вЂќР вЂ™Р’ВµР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’ВµР вЂ™Р’В·Р СћРЎвЂ™Р В Р’ВµР Р†Р вЂљР’В¦Р вЂ™Р’В·Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’В¶Р В РІР‚В°Р В РІР‚С™Р В Р’В¶Р РЋРЎв„ўР В РІР‚РЋР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’В·Р В РІР‚В Р РЋРІР‚СћР В РІвЂћвЂ“Р В РІР‚С™Р Р†Р вЂљР’В°Р В Р’В·Р РЋРЎСџР СћРЎвЂ™Р В РЎвЂР В РІР‚РЋР Р†Р вЂљР’В Р В Р’ВµР РЋРІР‚СњР Р†Р вЂљРЎС™Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў' },
    cv: { experience: 'Р В Р’В·Р вЂ™Р’В»Р В Р РЏР В РІвЂћвЂ“Р В РІР‚С›Р В Р вЂ°', education: 'Р В Р’В¶Р Р†Р вЂљРЎС›Р Р†РІР‚С›РЎС›Р В РЎвЂР Р†Р вЂљРЎв„ўР В РІР‚В ', prototypes: 'Р В Р’ВµР В РІР‚в„–Р РЋРЎСџР В Р’ВµР РЋРІР‚С”Р Р†Р вЂљРІвЂћвЂ“', rewards: 'Р В Р’ВµР СћРЎвЂ™Р Р†Р вЂљРІР‚СљР В Р’ВµР В РІР‚В°Р вЂ™Р’В±', print: 'Р В Р’В¶Р Р†Р вЂљР’В°Р Р†Р вЂљРЎС™Р В Р’ВµР В Р Р‰Р вЂ™Р’В°', downloadPdf: 'Р В РўвЂР РЋРІР‚ВР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂР В РІР‚В¦Р В РІР‚В¦PDF', viewDemo: 'Р В Р’В¶Р РЋРЎСџР СћРЎвЂ™Р В Р’В·Р РЋРЎв„ўР Р†Р вЂљРІвЂћвЂ“Р В Р’В¶Р РЋР’ВР Р†Р вЂљРЎСљР В Р’В·Р вЂ™Р’В¤Р РЋРІР‚Сњ' },
    about: { description: 'Р В РўвЂР РЋРІР‚СњР Р†Р вЂљР’В Р В РЎвЂР вЂ™Р’В§Р В РІвЂљВ¬Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’В¶Р Р†Р вЂљРІР‚СњР Р†Р вЂљР’В¦Р В Р’В·Р В Р С“Р Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р В РІР‚В°Р В РІР‚С™Р В РЎвЂР РЋРІР‚СљР В РІР‚В¦Р В РўвЂР вЂ™Р’В»Р СћРЎвЂ™Р В Р’ВµР В Р РЏР В РІР‚В°Р В Р’В¶Р В РІР‚в„–Р В Р С“Р В Р’ВµР В РІР‚В°Р В Р С“Р В Р’В¶Р Р†РІР‚С™Р’В¬Р Р†Р вЂљР’ВР В Р’ВµР Р†РІР‚С™Р’В¬Р Р†Р вЂљРЎвЂќР В РўвЂР В РІР‚В¦Р РЋРЎв„ўР В Р’В·Р РЋРІР‚СљР вЂ™Р’В­Р В Р’В¶Р РЋРІР‚СљР Р†Р вЂљР’В¦Р В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В Р’ВµР В РІР‚В°Р В Р С“Р В Р’ВµР В РІР‚В°Р Р†Р вЂљРЎвЂќР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў' },
    gallery: { description: 'Р В РІвЂћвЂ“Р В РІР‚С™Р РЋРІвЂћСћР В РЎвЂР РЋРІР‚вЂќР Р†Р вЂљР Р‹Р В РІвЂћвЂ“Р В Р вЂ№Р Р†РІР‚С›РІР‚вЂњР В Р’В·Р Р†Р вЂљРЎвЂќР вЂ™Р’В®Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р Р†Р вЂљР’ВР Р†Р вЂљРЎвЂєР В Р’ВµР В РІР‚В¦Р вЂ™Р’В±Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’ВµР Р†РІР‚С™Р’В¬Р Р†Р вЂљРЎвЂќР В Р’В¶Р Р†Р вЂљРЎвЂєР В Р РЏР В Р’В¶Р В РІР‚в„–Р РЋРЎвЂєР В Р’В·Р СћРІР‚ВР РЋРЎвЂєР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В РЎвЂР вЂ™Р’В§Р Р†Р вЂљР’В Р В РЎвЂР вЂ™Р’В§Р Р†Р вЂљР’В°Р В РўвЂР Р†РІР‚С›РІР‚вЂњР Р†Р вЂљРІвЂћвЂ“Р В Р’В¶Р Р†Р вЂљРІР‚СњР Р†Р вЂљР’В¦Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў', allAlbums: 'Р В Р’В¶Р Р†Р вЂљР’В°Р В РІР‚С™Р В Р’В¶Р РЋРЎв„ўР Р†Р вЂљР’В°Р В Р’В·Р Р†Р вЂљРЎвЂќР РЋРІР‚ВР В Р’ВµР Р†Р вЂљР’В Р В Р вЂ°' },
    search: { title: 'Р В Р’В¶Р РЋРІР‚в„ўР РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє', subtitle: 'Р В Р’ВµР РЋРЎв„ўР В Р С“Р В Р’ВµР В Р Р‰Р РЋРІвЂћСћР В Р’ВµР вЂ™Р’В®Р РЋРЎвЂєР В Р’В¶Р Р†Р вЂљРІР‚СљР Р†Р вЂљР Р‹Р В Р’В·Р вЂ™Р’В«Р вЂ™Р’В Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В·Р вЂ™Р’В»Р СћРІР‚ВР В Р’ВµР РЋРЎСџР РЋРІР‚СњР В Р’В¶Р Р†Р вЂљРІР‚СљР Р†Р вЂљР Р‹Р В Р’В·Р вЂ™Р’В«Р вЂ™Р’В Р В Р’ВµР Р†Р вЂљРІвЂћСћР В Р вЂ°Р В Р’В·Р Р†Р вЂљРЎСљР вЂ™Р’В»Р В Р’ВµР вЂ™Р’В»Р В РІР‚В°Р В РўвЂР РЋРІР‚ВР вЂ™Р’В­Р В Р’В¶Р РЋРЎСџР СћРЎвЂ™Р В Р’В¶Р Р†Р вЂљР’В°Р РЋРІР‚СћР В РўвЂР вЂ™Р’В»Р вЂ™Р’В»Р В РўвЂР В РІР‚В¦Р Р†Р вЂљРЎС›Р В Р’ВµР Р†Р вЂљР’В Р Р†Р вЂљР’В¦Р В Р’ВµР вЂ™Р’В®Р Р†РІР‚С›РІР‚вЂњ', placeholder: 'Р В Р’В¶Р РЋРІР‚в„ўР РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂєР В Р’В¶Р Р†Р вЂљР’В°Р В РІР‚С™Р В Р’В¶Р РЋРЎв„ўР Р†Р вЂљР’В°Р В Р’ВµР Р†Р вЂљР’В Р Р†Р вЂљР’В¦Р В Р’ВµР вЂ™Р’В®Р Р†РІР‚С›РІР‚вЂњ...', allContent: 'Р В Р’В¶Р Р†Р вЂљР’В°Р В РІР‚С™Р В Р’В¶Р РЋРЎв„ўР Р†Р вЂљР’В°Р В Р’ВµР Р†Р вЂљР’В Р Р†Р вЂљР’В¦Р В Р’ВµР вЂ™Р’В®Р Р†РІР‚С›РІР‚вЂњ', results: 'Р В Р’В·Р вЂ™Р’В»Р Р†Р вЂљРЎС™Р В Р’В¶Р РЋРІР‚С”Р РЋРЎв„ў' },
    stats: { blogPosts: 'Р В Р’ВµР В Р Р‰Р РЋРІвЂћСћР В Р’ВµР вЂ™Р’В®Р РЋРЎвЂєР В Р’В¶Р Р†Р вЂљРІР‚СљР Р†Р вЂљР Р‹Р В Р’В·Р вЂ™Р’В«Р вЂ™Р’В ', wikiArticles: 'Р В Р’В·Р вЂ™Р’В»Р СћРІР‚ВР В Р’ВµР РЋРЎСџР РЋРІР‚СњР В Р’В¶Р Р†Р вЂљРІР‚СљР Р†Р вЂљР Р‹Р В Р’В·Р вЂ™Р’В«Р вЂ™Р’В ', galleryImages: 'Р В Р’ВµР Р†Р вЂљРЎвЂќР РЋРІР‚СћР В Р’В·Р Р†Р вЂљР’В°Р Р†Р вЂљР Р‹', projects: 'Р В РІвЂћвЂ“Р В Р вЂ№Р Р†РІР‚С›РІР‚вЂњР В Р’В·Р Р†Р вЂљРЎвЂќР вЂ™Р’В®' },
  },
  ja: {
    nav: { home: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРЎвЂќР В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В ', about: 'Р В Р’В¶Р вЂ™Р’В¦Р Р†Р вЂљРЎв„ўР В РЎвЂР вЂ™Р’В¦Р В РЎвЂњ', wiki: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¦Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІвЂљВ¬Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В­', cv: 'Р В Р’ВµР вЂ™Р’В±Р СћРЎвЂ™Р В Р’В¶Р вЂ™Р’В­Р СћРІР‚ВР В Р’В¶Р Р†Р вЂљРЎвЂќР РЋРІР‚В', gallery: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В®Р В РЎвЂ“Р РЋРІР‚СљР В РІвЂљВ¬Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В©Р В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р РЋРІР‚СљР РЋР’В', blog: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СљР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В°', apps: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›', search: 'Р В Р’В¶Р вЂ™Р’В¤Р РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє', news: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р РЋРІР‚СљР СћРЎвЂ™Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†РІР‚С›РІР‚вЂњ', legal: 'Р В Р’В¶Р РЋРІР‚вЂњР Р†Р вЂљРЎС›Р В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В РІвЂћвЂ“Р В РІР‚С™Р РЋРІвЂћСћР В Р’В·Р РЋРЎСџР СћРЎвЂ™' },
    heroTitle: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В Р С“Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІвЂљВ¬Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СљР В РІвЂћвЂ“Р Р†Р вЂљРІР‚СљР Р†Р вЂљРІвЂћвЂ“Р В Р’В·Р Р†РІР‚С›РЎС›Р РЋРІР‚СњР В РЎвЂР В РІР‚С™Р Р†Р вЂљР’В¦',
    heroSubtitle: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В°Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’ВµР Р†Р вЂљР’В°Р вЂ™Р’ВµР В РІвЂћвЂ“Р В РІР‚С™Р вЂ™Р’В Р В Р’В¶Р В РІР‚С™Р вЂ™Р’В§Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р РЋРІР‚СљР Р†Р вЂљР’В¦Р В Р’В·Р Р†Р вЂљР’В Р вЂ™Р’В±Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В§Р В Р’В·Р РЋРІР‚СћР В РІР‚в„–Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІР‚СњР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР Р‹Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂќР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В«Р В РўвЂР В РІР‚В¦Р Р†Р вЂљРЎС™Р В РІвЂћвЂ“Р В Р С“Р Р†Р вЂљРЎС™Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В Р’В¶Р вЂ™Р’В§Р Р†Р вЂљРІвЂћвЂ“Р В Р’В·Р В РІР‚РЋР Р†Р вЂљР’В°Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ўР В Р’В·Р вЂ™Р’В§Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РўвЂР В РІР‚В¦Р РЋРЎв„ўР В Р’ВµР Р†Р вЂљРЎС™Р В РЎвЂњР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р В РІР‚С™Р РЋРЎС™Р В РЎвЂР В РІР‚С™Р РЋРІР‚СљР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В·Р РЋРЎСџР СћРЎвЂ™Р В РЎвЂР вЂ™Р’В­Р вЂ™Р’ВР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С›РЎС›Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В Р’В¶Р В РІР‚в„–Р РЋРЎвЂєР В Р’В·Р СћРІР‚ВР РЋРЎвЂєР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІР‚СњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В РЎвЂ“Р В РЎвЂњР В Р РЏР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂєР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў',
    searchPlaceholder: 'Р В Р’В¶Р вЂ™Р’В¤Р РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє...',
    categories: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В«Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР СћРІР‚ВР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›',
    tags: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂќР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В°',
    loading: 'Р В РЎвЂР В РІР‚С›Р вЂ™Р’В­Р В РЎвЂ“Р В РЎвЂњР РЋРІР‚вЂќР В РЎвЂР РЋРІР‚СћР РЋР’ВР В РЎвЂ“Р В РЎвЂњР РЋРІР‚вЂќР В РўвЂР РЋРІР‚ВР вЂ™Р’В­...',
    nothing: 'Р В РЎвЂР вЂ™Р’В¦Р Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¤Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚В°Р В РЎвЂ“Р В РЎвЂњР РЋРІР‚СћР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂќР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРЎС™Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў',
    back: 'Р В Р’В¶Р Р†РІР‚С™Р’В¬Р вЂ™Р’В»Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћвЂ“',
    nowReading: 'Р В РІвЂћвЂ“Р Р†Р вЂљРІР‚СљР В РІР‚В Р В РЎвЂР вЂ™Р’В¦Р вЂ™Р’В§Р В РўвЂР РЋРІР‚ВР вЂ™Р’В­',
    galleryTitle: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В®Р В РЎвЂ“Р РЋРІР‚СљР В РІвЂљВ¬Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В©Р В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р РЋРІР‚СљР РЋР’В',
    wikiTitle: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¦Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІвЂљВ¬Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В­',
    cvTitle: 'CV (Р В Р’ВµР вЂ™Р’В±Р СћРЎвЂ™Р В Р’В¶Р вЂ™Р’В­Р СћРІР‚ВР В Р’В¶Р Р†Р вЂљРЎвЂќР РЋРІР‚В:)',
    aboutTitle: 'Р В Р’В¶Р вЂ™Р’В¦Р Р†Р вЂљРЎв„ўР В РЎвЂР вЂ™Р’В¦Р В РЎвЂњ',
    projectsTitle: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ”Р РЋР’ВР РЋРІвЂћСћ',
    apps: {
      title: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›',
      subtitle: 'Р В Р’В·Р вЂ™Р’В§Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР Р‹Р В РЎвЂ“Р РЋРІР‚СљР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В¬Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В·Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В§Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњ',
      selectPrompt: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В РІвЂћвЂ“Р В РЎвЂњР РЋРІР‚ВР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¶Р В РЎвЂ“Р В РЎвЂњР В Р С“Р В РўвЂР РЋРІР‚ВР вЂ™Р’В­Р В Р’ВµР вЂ™Р’В¤Р вЂ™Р’В®Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В«Р В РЎвЂР В Р вЂ№Р В Р С“Р В Р’В·Р вЂ™Р’В¤Р РЋРІР‚СњР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В Р вЂ°Р В РЎвЂ“Р В РЎвЂњР РЋРІР‚СћР В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў',
      descriptionLabel: 'Р В РЎвЂР В РІР‚С›Р вЂ™Р’В¬Р В Р’В¶Р вЂ™Р’ВР В РІР‚в„–',
      platformsLabel: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В©Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚СљР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРЎС›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В©Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В ',
      technologiesLabel: 'Р В Р’В¶Р В РІР‚В°Р В РІР‚С™Р В РЎвЂР В Р вЂ№Р Р†Р вЂљРЎС™',
      badgesLabel: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂќР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В°',
      dateLabel: 'Р В Р’В¶Р Р†Р вЂљРІР‚СњР СћРЎвЂ™Р В РўвЂР вЂ™Р’В»Р вЂ™Р’В',
      openFullLabel: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРЎС›Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В«Р В РЎвЂР В Р вЂ№Р В Р С“Р В Р’В·Р вЂ™Р’В¤Р РЋРІР‚Сњ',
      categories: {
        ready: 'Р В Р’ВµР вЂ™Р’В®Р В Р вЂ°Р В Р’В¶Р Р†РІР‚С™Р’В¬Р РЋРІР‚в„ўР В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›',
        prototype: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂќР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚Сњ',
        'webos-emulation': 'WebOSР В РЎвЂ“Р Р†Р вЂљРЎв„ўР В Р С“Р В РЎвЂ“Р РЋРІР‚СљР РЋРЎСџР В РЎвЂ“Р РЋРІР‚СљР СћРЎвЂ™Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В¬Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В·Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В§Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњ',
      },
    },
    sections: { explore: 'Р В Р’В·Р вЂ™Р’В§Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РўвЂР РЋРІР‚ВР Р†Р вЂљРІР‚СљР В Р’В·Р Р†Р вЂљРЎС›Р В Р вЂ°Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В Р’В¶Р В РІР‚в„–Р РЋРЎвЂєР В Р’В·Р СћРІР‚ВР РЋРЎвЂє', exploreSubtitle: 'Р В Р’В·Р вЂ™Р’В§Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РўвЂР вЂ™Р’В»Р Р†Р вЂљРЎС›Р В РўвЂР РЋРІР‚СњР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р В РЎвЂњР В Р С“Р В РЎвЂР Р†РІР‚С™Р’В¬Р Р†РІР‚С™Р’В¬Р В Р’ВµР Р†Р вЂљР’ВР РЋРІР‚вЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р В РЎвЂњР РЋРІР‚СћР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІР‚СљР В РЎвЂ“Р В РЎвЂњР РЋРІР‚СћР В РЎвЂ“Р В РЎвЂњР В РІР‚С›Р В Р’ВµР В РЎвЂњР СћРІР‚ВР В РІвЂћвЂ“Р РЋРЎС™Р РЋРЎвЂєР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В«Р В РІвЂћвЂ“Р В РІвЂљВ¬Р Р†Р вЂљРЎвЂќР В РЎвЂ“Р В РЎвЂњР РЋРІР‚вЂњР В РЎвЂР РЋРІР‚СћР РЋР’ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚С™' },
    latestPosts: { title: 'Р В Р’В¶Р РЋРЎв„ўР В РІР‚С™Р В Р’В¶Р Р†Р вЂљРІР‚СљР вЂ™Р’В°Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В Р’В¶Р В РІР‚В°Р Р†Р вЂљРЎС›Р В Р’В·Р В Р С“Р РЋРІР‚вЂќ', subtitle: 'Р В Р’В¶Р Р†Р вЂљРІР‚СљР вЂ™Р’В°Р В РІвЂћвЂ“Р вЂ™Р’В®Р вЂ™Р’В®Р В РЎвЂ“Р В РЎвЂњР В РІР‚С›Р В РЎвЂР В РІР‚С™Р РЋРІР‚СљР В РЎвЂ“Р В РЎвЂњР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РЎвЂњР В Р С“Р В Р’В¶Р СћРІР‚ВР РЋРІР‚С”Р В Р’ВµР В РІР‚РЋР РЋРЎСџ', viewAll: 'Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В РЎвЂР В Р вЂ№Р В Р С“Р В Р’В·Р вЂ™Р’В¤Р РЋРІР‚Сњ' },
    cta: { letsCreate: 'Р В РўвЂР РЋРІР‚ВР В РІР‚С™Р В Р’В·Р вЂ™Р’В·Р Р†Р вЂљРІвЂћСћР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В«', together: 'Р В РўвЂР В РІР‚В¦Р РЋРЎв„ўР В Р’В¶Р Р†РІР‚С™Р’В¬Р РЋРІР‚в„ўР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІР‚СњР В РЎвЂ“Р В РЎвЂњР РЋРІР‚СћР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІР‚СњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљР Р‹Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљР’В ', description: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР Р‹Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р В РЎвЂњР В Р вЂ°Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎв„ўР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћвЂ“Р В Р’ВµР вЂ™Р’В Р СћРІР‚ВР В Р’ВµР РЋРІР‚в„ўР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРЎв„ўР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’ВµР В Р Р‰Р вЂ™Р’ВР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В«Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¤Р В РЎвЂ“Р В РЎвЂњР В РІР‚С›Р В РЎвЂ“Р В РЎвЂњР В Р вЂ°Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚В°Р В РЎвЂ“Р В РЎвЂњР РЋРЎСџР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂєР В Р’ВµР вЂ™Р’В Р СћРІР‚ВР В Р’ВµР РЋРІР‚в„ўР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРЎв„ўР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР РЋРЎв„ўР В РЎвЂ“Р В РЎвЂњР В РІР‚В Р В РЎвЂ“Р В РЎвЂњР В РІР‚В°Р В РЎвЂР В РЎвЂњР РЋРІР‚С”Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂќР В РЎвЂ“Р В РЎвЂњР В Р РЏР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂєР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў', getInTouch: 'Р В РЎвЂ“Р В РЎвЂњР В РІР‚В°Р В Р’ВµР Р†Р вЂљРЎС›Р В Р РЏР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂєР В Р’ВµР РЋРІР‚в„ўР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В Р РЏР В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂќ' },
    blog: { title: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СљР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В°', subtitle: 'Р В РІвЂћвЂ“Р Р†Р вЂљРІР‚СљР Р†Р вЂљРІвЂћвЂ“Р В Р’В·Р Р†РІР‚С›РЎС›Р РЋРІР‚СњР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР Р‹Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¶Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР В РІР‚в„–Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В«Р В РІвЂћвЂ“Р Р†Р вЂљРІР‚СљР РЋРЎвЂєР В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂР В РІР‚С™Р РЋРІР‚СљР В РЎвЂ“Р В РЎвЂњР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР СћРЎвЂ™Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В«Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р СћРІР‚ВР РЋРІР‚С”Р В Р’ВµР В РІР‚РЋР РЋРЎСџР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў', description: 'Р В РІвЂћвЂ“Р Р†Р вЂљРІР‚СљР Р†Р вЂљРІвЂћвЂ“Р В Р’В·Р Р†РІР‚С›РЎС›Р РЋРІР‚СњР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР Р‹Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¶Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР В РІР‚в„–Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В«Р В РІвЂћвЂ“Р Р†Р вЂљРІР‚СљР РЋРЎвЂєР В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂР В РІР‚С™Р РЋРІР‚СљР В РЎвЂ“Р В РЎвЂњР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР СћРЎвЂ™Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В«Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’В¶Р СћРІР‚ВР РЋРІР‚С”Р В Р’ВµР В РІР‚РЋР РЋРЎСџР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў' },
    wiki: { description: 'Р В Р’В·Р вЂ™Р’В§Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР В Р вЂ°Р В Р’В¶Р В РІР‚РЋР В РІР‚в„–Р В Р’В¶Р Р†Р вЂљРІР‚СњР СћРЎвЂ™Р В РўвЂР В РІР‚В¦Р РЋРІР‚вЂќР В Р’В·Р Р†Р вЂљРЎСљР В Р С“Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћвЂ“Р В Р’В¶Р вЂ™Р’В¦Р Р†Р вЂљРЎв„ўР В Р’ВµР РЋРІР‚вЂќР вЂ™Р’ВµР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В«Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚СљР В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В­Р В РЎвЂ“Р РЋРІР‚СљР СћРЎвЂ™Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В¬Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В Р вЂ°Р В РЎвЂ“Р В РЎвЂњР РЋРЎСџР В Р’В·Р РЋРЎСџР СћРЎвЂ™Р В РЎвЂР вЂ™Р’В­Р вЂ™Р’ВР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С›РЎС›Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў' },
    cv: { experience: 'Р В Р’В·Р вЂ™Р’ВµР В Р вЂ°Р В РІвЂћвЂ“Р В Р С“Р Р†Р вЂљРЎС™', education: 'Р В Р’ВµР вЂ™Р’В­Р вЂ™Р’В¦Р В Р’В¶Р вЂ™Р’В­Р СћРІР‚В', prototypes: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂќР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚Сњ', rewards: 'Р В РЎвЂР РЋРІР‚вЂњР РЋРІР‚С”', print: 'Р В Р’ВµР В Р Р‰Р вЂ™Р’В°Р В Р’ВµР Р†РІР‚С™Р’В¬Р вЂ™Р’В·', downloadPdf: 'PDFР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С™Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¦Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В°', viewDemo: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР Р‹Р В РЎвЂ“Р РЋРІР‚СљР РЋРЎвЂєР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В РЎвЂР вЂ™Р’В¦Р Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћвЂ“' },
    about: { description: 'Р В Р’В·Р вЂ™Р’В§Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В Р’В¶Р Р†Р вЂљРІР‚СњР Р†Р вЂљР’В¦Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В­Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В«Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р В РЎвЂњР РЋРЎС™Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРІР‚СњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В Р’ВµР Р†Р вЂљР’В°Р вЂ™Р’ВµР В РІвЂћвЂ“Р В РІР‚С™Р вЂ™Р’В Р В РЎвЂ“Р В РЎвЂњР РЋРІР‚ВР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В Р’В¶Р РЋРІР‚СљР Р†Р вЂљР’В¦Р В Р’В·Р Р†Р вЂљР’В Р вЂ™Р’В±Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В РІвЂћвЂ“Р вЂ™Р’В§Р Р†Р вЂљР’В Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚В°Р В Р’В·Р вЂ™Р’В«Р Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРЎв„ўР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В«Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¤Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂєР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В Р’ВµР вЂ™Р’В­Р вЂ™Р’В¦Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРЎС™Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В§Р В РЎвЂ“Р В РЎвЂњР В Р РЏР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎС›Р В РЎвЂ“Р В РЎвЂњР Р†Р вЂљРЎвЂєР В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў' },
    gallery: { description: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В Р’ВµР Р†Р вЂљР’В Р Р†РІР‚С›РЎС›Р В Р’В·Р РЋРЎв„ўР РЋРЎСџР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В Р С“Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІвЂљВ¬Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СљР В РЎвЂ“Р В РЎвЂњР В РІР‚С›Р В Р’В¶Р В РІР‚в„–Р РЋРЎвЂєР В Р’В¶Р вЂ™Р’В±Р Р†Р вЂљРЎв„ўР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В РІвЂћвЂ“Р В РІР‚С™Р РЋРІвЂћСћР В РЎвЂ“Р В РЎвЂњР вЂ™Р’ВР В РЎвЂ“Р В РЎвЂњР РЋРЎСџР В РЎвЂР вЂ™Р’В¦Р Р†Р вЂљРІР‚СљР В РЎвЂР вЂ™Р’В¦Р РЋРІвЂћСћР В Р’В·Р РЋРІвЂћСћР Р†Р вЂљРЎвЂєР В РЎвЂ“Р В РЎвЂњР В РІР‚С›Р В Р’В¶Р Р†Р вЂљРІР‚СњР Р†Р вЂљР’В¦Р В РЎвЂ“Р В РІР‚С™Р Р†Р вЂљРЎв„ў', allAlbums: 'Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРЎвЂєР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В«Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚в„ўР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В ' },
    search: { title: 'Р В Р’В¶Р вЂ™Р’В¤Р РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє', subtitle: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СљР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В°Р В Р’В¶Р В РІР‚В°Р Р†Р вЂљРЎС›Р В Р’В·Р В Р С“Р РЋРІР‚вЂќР В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¦Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІвЂљВ¬Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В­Р В РЎвЂР В Р С“Р вЂ™Р’ВР В РўвЂР РЋРІР‚СњР Р†Р вЂљРІвЂћвЂ“Р В РЎвЂ“Р В РІР‚С™Р В РЎвЂњР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В®Р В РЎвЂ“Р РЋРІР‚СљР В РІвЂљВ¬Р В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В©Р В РЎвЂ“Р РЋРІР‚СљР В РІР‚С›Р В РЎвЂ“Р РЋРІР‚СљР РЋР’ВР В Р’ВµР Р†Р вЂљР’В¦Р В Р С“Р В РўвЂР В РІР‚В¦Р Р†Р вЂљРЎС™Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В§Р В РўвЂР В РІР‚В¦Р Р†Р вЂљРЎС›Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРЎв„ўР В Р’В¶Р вЂ™Р’В¤Р РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє', placeholder: 'Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРЎвЂєР В РЎвЂ“Р Р†Р вЂљРЎв„ўР Р†Р вЂљРІвЂћСћР В Р’В¶Р вЂ™Р’В¤Р РЋРЎв„ўР В Р’В·Р СћРІР‚ВР РЋРЎвЂє...', allContent: 'Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РЎС›Р В РЎвЂ“Р В РЎвЂњР Р†РІР‚С›РІР‚вЂњР В РЎвЂ“Р В РЎвЂњР вЂ™Р’В¦Р В РЎвЂ“Р В РЎвЂњР вЂ™Р’В®Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљР’В Р В РЎвЂ“Р РЋРІР‚СљР РЋРІР‚вЂњР В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРЎвЂє', results: 'Р В Р’В·Р вЂ™Р’ВµР РЋРІР‚в„ўР В Р’В¶Р РЋРІР‚С”Р РЋРЎв„ў' },
    stats: { blogPosts: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СљР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В°Р В Р’В¶Р В РІР‚В°Р Р†Р вЂљРЎС›Р В Р’В·Р В Р С“Р РЋРІР‚вЂќ', wikiArticles: 'Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В¦Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІвЂљВ¬Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В­Р В РЎвЂР В Р С“Р вЂ™Р’ВР В РўвЂР РЋРІР‚СњР Р†Р вЂљРІвЂћвЂ“', galleryImages: 'Р В Р’В·Р Р†Р вЂљРЎСљР вЂ™Р’В»Р В Р’ВµР РЋРІР‚СљР В Р РЏ', projects: 'Р В РЎвЂ“Р РЋРІР‚СљР Р†Р вЂљРІР‚СњР В РЎвЂ“Р РЋРІР‚СљР вЂ™Р’В­Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР РЋРІР‚ВР В РЎвЂ“Р Р†Р вЂљРЎв„ўР вЂ™Р’В§Р В РЎвЂ“Р Р†Р вЂљРЎв„ўР В РІР‚РЋР В РЎвЂ“Р РЋРІР‚СљР Р†РІР‚С™Р’В¬' },
  },
  ko: {
    nav: { home: 'Р В Р вЂ¦Р Р†РІР‚С›РЎС›Р Р†РІР‚С™Р’В¬', about: 'Р В РЎВР Р†Р вЂљР’В Р В Р вЂ°Р В РЎвЂќР вЂ™Р’В°Р РЋРЎв„ў', wiki: 'Р В РЎВР РЋРЎв„ўР Р†Р вЂљРЎвЂєР В Р вЂ¦Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤', cv: 'Р В РЎВР РЋРЎС™Р СћРІР‚ВР В Р’В»Р вЂ™Р’В Р СћРЎвЂ™Р В РЎВР Р†Р вЂљРЎвЂєР РЋРЎв„ў', gallery: 'Р В РЎвЂќР вЂ™Р’В°Р вЂ™Р’В¤Р В Р’В»Р РЋРЎСџР вЂ™Р’В¬Р В Р’В»Р вЂ™Р’В¦Р вЂ™Р’В¬', blog: 'Р В Р’В»Р РЋРІР‚ВР Р†Р вЂљРЎСљР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎвЂќР вЂ™Р’В·Р РЋРІР‚В', apps: 'Р В РЎВР Р†Р вЂљРЎС›Р вЂ™Р’В±', search: 'Р В РЎвЂќР В РІР‚В Р В РІР‚С™Р В РЎВР РЋРІР‚СљР Р†Р вЂљР’В°', news: 'Р В Р’В»Р Р†Р вЂљР’В°Р СћРІР‚ВР В РЎВР В РІР‚В°Р вЂ™Р’В¤', legal: 'Р В Р’В»Р В РІР‚В Р Р†Р вЂљРЎС›Р В РЎВР вЂ™Р’В Р В РЎвЂњ Р В РЎвЂќР РЋРІР‚вЂњР вЂ™Р’В Р В РЎВР вЂ™Р’В§Р В РІР‚С™' },
    heroTitle: 'Р В Р вЂ¦Р В РЎвЂњР вЂ™Р’В¬Р В Р’В»Р вЂ™Р’В¦Р вЂ™Р’В¬Р В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ўР В РЎВР РЋРЎС™Р СћРІР‚ВР В Р вЂ¦Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В°Р В Р’В»Р РЋРІР‚ВР В Р вЂ° Р В РЎвЂќР вЂ™Р’В°Р РЋРЎв„ўР В Р’В»Р вЂ™Р’В°Р РЋРЎв„ўР В РЎВР РЋРІР‚С”Р РЋРІР‚в„ў',
    heroSubtitle: 'Р В РЎВР В РІР‚В¦Р Р†Р вЂљРЎСљР В Р’В»Р Р†Р вЂљРЎС™Р РЋРЎв„ў, Р В РЎВР вЂ™Р’В°Р В РІР‚В¦Р В РЎВР РЋРЎС™Р вЂ™Р’ВР В РЎВР Р†Р вЂљРЎвЂєР вЂ™Р’В±, Р В РЎВР Р†Р вЂљРІР‚СњР СћРІР‚ВР В РЎВР вЂ™Р’В Р Р†Р вЂљРЎС›Р В РЎВР РЋРЎв„ўР РЋР’ВР В Р’В»Р В Р вЂ№Р РЋРЎв„ў Р В РЎВР Р†Р вЂљРЎС›Р Р†Р вЂљРЎвЂєР В Р’В»Р вЂ™Р’В¦Р Р†Р вЂљРЎвЂєР В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¤Р В РЎВР РЋРІвЂћСћР СћРІР‚В Р В Р’В»Р Р†Р вЂљРЎСљР Р†Р вЂљРЎСљР В РЎВР вЂ™Р’В§Р В РІР‚С™Р В Р вЂ¦Р Р†Р вЂљРЎвЂєР РЋРІР‚В Р В РЎвЂќР В РІР‚В Р В РІР‚В¦Р В Р вЂ¦Р Р†Р вЂљРІР‚СњР вЂ™Р’ВР В РЎВР РЋРЎС™Р Р†Р вЂљРЎвЂє Р В РЎвЂќР вЂ™Р’ВµР вЂ™Р’В¬Р В РЎВР вЂ™Р’В¶Р Р†Р вЂљРЎС›Р В Р вЂ¦Р Р†Р вЂљРЎС›Р вЂ™Р’В©Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р Р†РІР‚С™Р’В¬Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¤. Р В РЎВР вЂ™Р’В Р РЋРЎв„ў Р В РЎВР РЋРІР‚С”Р Р†Р вЂљР’ВР В РЎВР Р†Р вЂљРІР‚СњР Р†Р вЂљР’В¦, Р В РЎВР РЋРІР‚СљР РЋРЎС™Р В РЎвЂќР вЂ™Р’В°Р В РЎвЂњ, Р В РЎВР вЂ™Р’В§Р В РІР‚С™Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р РЋРЎС™ Р В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°Р В Р’В»Р вЂ™Р’В°Р вЂ™Р’ВР В РЎВР РЋРЎС™Р Р†Р вЂљРЎвЂє Р В Р вЂ¦Р РЋРІР‚СљР РЋРІР‚в„ўР В РЎВР РЋРІР‚СљР Р†Р вЂљР’В°Р В Р вЂ¦Р Р†Р вЂљРЎС›Р вЂ™Р’ВР В РЎВР Р†Р вЂљРЎвЂєР РЋРІР‚ВР В РЎВР РЋРІвЂћСћР Р†Р вЂљРЎСљ.',
    searchPlaceholder: 'Р В РЎвЂќР В РІР‚В Р В РІР‚С™Р В РЎВР РЋРІР‚СљР Р†Р вЂљР’В°...',
    categories: 'Р В РЎВР Р†РІР‚С›РІР‚вЂњР СћРІР‚ВР В Р вЂ¦Р Р†Р вЂљР’В¦Р В Р вЂ°Р В РЎвЂќР РЋРІР‚вЂњР вЂ™Р’В Р В Р’В»Р вЂ™Р’В¦Р вЂ™Р’В¬',
    tags: 'Р В Р вЂ¦Р РЋРІР‚СљР РЋРЎв„ўР В РЎвЂќР вЂ™Р’В·Р РЋРІР‚В',
    loading: 'Р В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В Р’В»Р Р†Р вЂљРЎС™Р РЋРЎв„ў Р В РЎВР вЂ™Р’В¤Р Р†Р вЂљР’В...',
    nothing: 'Р В РЎвЂќР В РІР‚В Р В РІР‚С™Р В РЎВР РЋРІР‚СљР Р†Р вЂљР’В° Р В РЎвЂќР В РІР‚В Р вЂ™Р’В°Р В РЎвЂќР РЋРІР‚вЂњР РЋР’В Р В РЎВР Р†Р вЂљРІР‚СњР Р†Р вЂљР’В Р В РЎВР РЋРЎС™Р В Р вЂ°.',
    back: 'Р В Р’В»Р Р†Р вЂљРІвЂћСћР вЂ™Р’В¤Р В Р’В»Р В Р вЂ№Р РЋРЎв„ў',
    nowReading: 'Р В РЎВР РЋРЎС™Р В РІР‚В¦Р В Р’В»Р В РІР‚В°Р Р†Р вЂљРЎСљ Р В РЎВР вЂ™Р’В¤Р Р†Р вЂљР’В',
    galleryTitle: 'Р В РЎвЂќР вЂ™Р’В°Р вЂ™Р’В¤Р В Р’В»Р РЋРЎСџР вЂ™Р’В¬Р В Р’В»Р вЂ™Р’В¦Р вЂ™Р’В¬',
    wikiTitle: 'Р В РЎВР РЋРЎв„ўР Р†Р вЂљРЎвЂєР В Р вЂ¦Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤',
    cvTitle: 'CV (Р В РЎВР РЋРЎС™Р СћРІР‚ВР В Р’В»Р вЂ™Р’В Р СћРЎвЂ™Р В РЎВР Р†Р вЂљРЎвЂєР РЋРЎв„ў:)',
    aboutTitle: 'Р В РЎВР Р†Р вЂљР’В Р В Р вЂ°Р В РЎвЂќР вЂ™Р’В°Р РЋРЎв„ў',
    projectsTitle: 'Р В Р вЂ¦Р Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂєР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎВР вЂ™Р’В Р РЋРЎС™Р В Р вЂ¦Р В РІР‚В°Р РЋРІР‚В:',
    sections: { explore: 'Р В Р’В»Р Р†Р вЂљРЎв„ўР СћРІР‚В Р В РЎВР Р†Р вЂљРЎвЂєР РЋРІР‚ВР В РЎвЂќР РЋРІР‚вЂњР Р†Р вЂљРЎвЂє Р В Р вЂ¦Р РЋРІР‚СљР РЋРІР‚в„ўР В Р вЂ¦Р Р†Р вЂљРІР‚СњР вЂ™Р’В', exploreSubtitle: 'Р В Р’В»Р Р†Р вЂљРЎв„ўР СћРІР‚В Р В РЎВР РЋРІР‚С”Р Р†Р вЂљР’ВР В РЎВР Р†Р вЂљРІР‚СњР Р†Р вЂљР’В¦Р В РЎвЂќР РЋРІР‚вЂњР РЋР’В Р В РЎвЂќР СћРІР‚ВР В РІР‚С™Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¬Р В РЎВР Р†Р вЂљРЎв„ўР вЂ™Р’В¬Р В РЎВР РЋРЎС™Р вЂ™Р’В Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¤Р В РЎВР Р†Р вЂљРІР‚СљР Р†Р вЂљР’ВР В Р вЂ¦Р Р†Р вЂљРЎС›Р РЋРЎв„ў Р В РЎВР РЋРІР‚ВР В Р вЂ№Р В Р’В»Р вЂ™Р’В©Р СћРІР‚ВР В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ў Р В Р’В»Р Р†РІР‚С›РІР‚вЂњР вЂ™Р’В Р В РЎВР вЂ™Р’В Р РЋРІР‚ВР В Р’В»Р РЋРІР‚вЂњР СћРІР‚ВР В РЎВР Р†Р вЂљРЎвЂєР РЋРІР‚ВР В РЎВР РЋРІвЂћСћР Р†Р вЂљРЎСљ' },
    apps: {
      title: 'Р В РЎВР Р†Р вЂљРЎС›Р вЂ™Р’В±',
      subtitle: 'Р В Р’В»Р Р†Р вЂљРЎв„ўР СћРІР‚В Р В Р вЂ¦Р Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂєР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎВР вЂ™Р’В Р РЋРЎС™Р В Р вЂ¦Р В РІР‚В°Р РЋРІР‚В Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р РЋРЎв„ўР В РЎВР Р†Р вЂљРІР‚СњР вЂ™Р’В°',
      selectPrompt: 'Р В РЎВР Р†Р вЂљРЎС›Р вЂ™Р’В±Р В РЎВР РЋРЎС™Р Р†Р вЂљРЎвЂє Р В РЎВР Р†Р вЂљРЎвЂєР вЂ™Р’В Р В Р вЂ¦Р РЋРІР‚СљР РЋРЎС™Р В Р вЂ¦Р Р†Р вЂљРЎС›Р вЂ™Р’ВР В Р’В»Р вЂ™Р’В©Р СћРІР‚В Р В РЎВР вЂ™Р’В¤Р Р†Р вЂљР’ВР В РЎВР Р†Р вЂљРЎС›Р Р†РІР‚С›РЎС›Р В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ўР В РЎВР Р†Р вЂљРЎвЂєР РЋРЎв„ў Р В РЎВР Р†Р вЂљРІР‚СњР СћРІР‚ВР В Р’В»Р вЂ™Р’В¦Р В РІР‚В¦Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р Р†РІР‚С™Р’В¬Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¤.',
      descriptionLabel: 'Р В РЎВР Р†Р вЂљРЎвЂєР вЂ™Р’В¤Р В Р’В»Р В РІР‚С›Р Р†Р вЂљР’В¦',
      platformsLabel: 'Р В Р вЂ¦Р Р†Р вЂљРЎСљР В Р вЂ°Р В Р’В»Р РЋРІР‚С”Р вЂ™Р’В«Р В Р вЂ¦Р В Р РЏР РЋР’В',
      technologiesLabel: 'Р В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°Р В РЎВР Р†РІР‚С™Р’В¬Р вЂ™Р’В ',
      badgesLabel: 'Р В Р вЂ¦Р РЋРІР‚СљР РЋРЎв„ўР В РЎвЂќР вЂ™Р’В·Р РЋРІР‚В',
      dateLabel: 'Р В Р’В»Р Р†Р вЂљРЎв„ўР вЂ™Р’В Р В РЎВР вЂ™Р’В§Р РЋРЎв„ў',
      openFullLabel: 'Р В РЎВР вЂ™Р’В Р Р†Р вЂљРЎвЂєР В РЎВР В РІР‚В Р СћРІР‚В Р В РЎВР Р†Р вЂљРІР‚СњР СћРІР‚ВР В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°',
      categories: {
        ready: 'Р В РЎВР Р†РІР‚С›РЎС›Р Р†Р вЂљРЎвЂєР В РЎВР Р†Р вЂљРЎвЂєР вЂ™Р’В±Р В Р’В»Р РЋРІР‚в„ўР РЋРЎв„ў Р В РЎВР Р†Р вЂљРЎС›Р вЂ™Р’В±',
        prototype: 'Р В Р вЂ¦Р Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂєР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’В Р В Р вЂ¦Р РЋРІР‚СљР В РІР‚С™Р В РЎВР РЋРІР‚С”Р Р†Р вЂљР’В¦',
        'webos-emulation': 'WebOS Р В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ўР В Р’В»Р вЂ™Р’В®Р вЂ™Р’В¬Р В Р’В»Р вЂ™Р’В Р Р†РІР‚С™Р’В¬Р В РЎВР РЋРЎС™Р СћРІР‚ВР В РЎВР Р†Р вЂљР’В¦Р вЂ™Р’В',
      },
    },
    latestPosts: { title: 'Р В РЎВР вЂ™Р’ВµР РЋРЎв„ўР В РЎВР Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В  Р В РЎвЂќР В РІР‚В Р В Р вЂ°Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р РЋРЎв„ўР В Р’В»Р вЂ™Р’В¬Р РЋР’В', subtitle: 'Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В Р В РЎВР Р†Р вЂљРЎвЂєР вЂ™Р’В Р В Р вЂ¦Р Р†Р вЂљРЎС›Р РЋРЎв„ў Р В РЎВР РЋРІР‚СљР РЋРЎС™Р В РЎвЂќР вЂ™Р’В°Р В РЎвЂњР В РЎвЂќР РЋРІР‚вЂњР РЋР’В Р В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’ВµР В РЎВР вЂ™Р’В°Р вЂ™Р’В°', viewAll: 'Р В Р’В»Р В РІР‚С›Р В Р С“Р В Р’В»Р Р†Р вЂљР’ВР РЋРІР‚в„ў Р В Р’В»Р РЋРІР‚вЂњР СћРІР‚ВР В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°' },
    cta: { letsCreate: 'Р В Р вЂ¦Р Р†Р вЂљРЎС›Р В Р С“Р В РЎвЂќР вЂ™Р’В»Р вЂ™Р’В', together: 'Р В Р’В»Р вЂ™Р’В§Р В Р вЂ°Р В Р’В»Р Р†Р вЂљРЎС™Р вЂ™Р’В¤Р В РЎВР Р†Р вЂљРІР‚СљР СћРІР‚ВР В РЎВР РЋРІвЂћСћР Р†Р вЂљРЎСљ', description: 'Р В Р вЂ¦Р Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂєР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎВР вЂ™Р’В Р РЋРЎС™Р В Р вЂ¦Р В РІР‚В°Р РЋРІР‚В Р В РЎВР Р†Р вЂљРЎС›Р Р†Р вЂљРЎвЂєР В РЎВР РЋРЎС™Р СћРІР‚ВР В Р’В»Р Р†Р вЂљРЎСљР Р†Р вЂљРЎСљР В РЎВР Р†Р вЂљРІР‚СљР СћРІР‚ВР В РЎвЂќР вЂ™Р’В°Р В РІР‚С™ Р В РЎВР РЋРІР‚С”Р Р†РІР‚С™Р’В¬Р В РЎвЂќР вЂ™Р’В±Р вЂ™Р’В°Р В Р’В»Р Р†Р вЂљРЎв„ўР вЂ™Р’В Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р В Р С“Р В РЎВР Р†РІР‚С™Р’В¬Р РЋРЎв„ўР В Р вЂ¦Р РЋРІР‚С”Р Р†РІР‚С™Р’В¬ Р В РЎВР Р†Р вЂљРІР‚СњР вЂ™Р’В°Р В РЎвЂќР В РІР‚В Р вЂ™Р’В°Р В Р вЂ¦Р Р†Р вЂљРЎС›Р вЂ™Р’ВР В РЎвЂќР РЋРІР‚вЂњР вЂ™Р’В  Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¶Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¤Р В Р’В»Р вЂ™Р’В©Р СћРІР‚В Р В РЎВР Р†Р вЂљРІР‚СњР вЂ™Р’В°Р В Р’В»Р РЋРЎС™Р В РІР‚В¦ Р В РЎВР В РІвЂљВ¬Р РЋР’ВР В РЎВР Р†Р вЂљРЎвЂєР РЋРІР‚ВР В РЎВР РЋРІвЂћСћР Р†Р вЂљРЎСљ.', getInTouch: 'Р В РЎВР Р†Р вЂљРІР‚СњР вЂ™Р’В°Р В Р’В»Р РЋРЎС™Р В РІР‚В¦Р В Р вЂ¦Р Р†Р вЂљРЎС›Р вЂ™Р’ВР В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°' },
    blog: { title: 'Р В Р’В»Р РЋРІР‚ВР Р†Р вЂљРЎСљР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎвЂќР вЂ™Р’В·Р РЋРІР‚В', subtitle: 'Р В РЎвЂќР вЂ™Р’В°Р РЋРЎв„ўР В Р’В»Р вЂ™Р’В°Р РЋРЎв„ў, Р В Р’В»Р Р†Р вЂљРЎСљР Р†Р вЂљРЎСљР В РЎВР РЋРІР‚С”Р РЋРІР‚в„ўР В РЎВР РЋРЎС™Р РЋРІР‚В, Р В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°Р В РЎВР Р†РІР‚С™Р’В¬Р вЂ™Р’В Р В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ў Р В Р’В»Р В Р вЂ°Р В РІР‚С™Р В Р вЂ¦Р Р†Р вЂљРЎС›Р РЋРЎв„ў Р В РЎВР РЋРІР‚СљР РЋРЎС™Р В РЎвЂќР вЂ™Р’В°Р В РЎвЂњ, Р В Р вЂ¦Р В РІР‚В°Р РЋРЎв„ўР В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’В Р В Р’В»Р вЂ™Р’В¦Р вЂ™Р’В¬Р В РЎВР Р†Р вЂљРІР‚СљР РЋР’В, Р В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’ВµР В РЎВР вЂ™Р’В°Р вЂ™Р’В°.', description: 'Р В РЎвЂќР вЂ™Р’В°Р РЋРЎв„ўР В Р’В»Р вЂ™Р’В°Р РЋРЎв„ў, Р В Р’В»Р Р†Р вЂљРЎСљР Р†Р вЂљРЎСљР В РЎВР РЋРІР‚С”Р РЋРІР‚в„ўР В РЎВР РЋРЎС™Р РЋРІР‚В, Р В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°Р В РЎВР Р†РІР‚С™Р’В¬Р вЂ™Р’В Р В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ў Р В Р’В»Р В Р вЂ°Р В РІР‚С™Р В Р вЂ¦Р Р†Р вЂљРЎС›Р РЋРЎв„ў Р В РЎВР РЋРІР‚СљР РЋРЎС™Р В РЎвЂќР вЂ™Р’В°Р В РЎвЂњ, Р В Р вЂ¦Р В РІР‚В°Р РЋРЎв„ўР В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’В Р В Р’В»Р вЂ™Р’В¦Р вЂ™Р’В¬Р В РЎВР Р†Р вЂљРІР‚СљР РЋР’В, Р В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’ВµР В РЎВР вЂ™Р’В°Р вЂ™Р’В°.' },
    wiki: { description: 'Р В Р’В»Р вЂ™Р’В§Р вЂ™Р’В¤Р В РЎВР РЋРЎС™Р РЋР’В Р В РЎВР Р†Р вЂљРЎв„ўР вЂ™Р’В¬Р В РЎВР РЋРІвЂћСћР вЂ™Р’В©Р В Р вЂ¦Р Р†Р вЂљРЎС›Р вЂ™Р’ВР В Р’В»Р В РІР‚В°Р Р†Р вЂљРЎСљ Р В РЎвЂќР вЂ™Р’В°Р РЋРЎв„ўР В Р’В»Р Р†Р вЂљР’В¦Р РЋРІР‚в„ў, Р В Р’В»Р В Р РЏР Р†Р вЂљРЎвЂєР В РЎвЂќР вЂ™Р’ВµР вЂ™Р’В¬, Р В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°Р В РЎВР Р†РІР‚С™Р’В¬Р вЂ™Р’В Р В РЎВР РЋРЎС™Р вЂ™Р’В Р В Р вЂ¦Р В РЎвЂњР РЋРІР‚в„ўР В Р’В»Р вЂ™Р’В Р Р†РІР‚С™Р’В¬Р В РЎВР РЋРЎС™Р СћРІР‚ВР В РЎВР Р†Р вЂљР’В¦Р вЂ™Р’ВР В Р’В»Р РЋРІР‚в„ўР РЋРЎв„ў Р В РЎВР вЂ™Р’В§Р В РІР‚С™Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р РЋРЎС™ Р В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°Р В Р’В»Р вЂ™Р’В°Р вЂ™Р’В.' },
    cv: { experience: 'Р В РЎвЂќР В РІР‚В Р В РІР‚В¦Р В Р’В»Р вЂ™Р’В Р СћРЎвЂ™', education: 'Р В РЎвЂќР вЂ™Р’ВµР РЋРІР‚в„ўР В РЎВР РЋРЎв„ўР В Р вЂ№', prototypes: 'Р В Р вЂ¦Р Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂєР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’В Р В Р вЂ¦Р РЋРІР‚СљР В РІР‚С™Р В РЎВР РЋРІР‚С”Р Р†Р вЂљР’В¦', rewards: 'Р В РЎВР РЋРІР‚СљР В РЎвЂњ', print: 'Р В РЎВР РЋРЎС™Р РЋРІР‚ВР В РЎВР Р†Р вЂљР Р‹Р Р†Р вЂљРЎвЂє', downloadPdf: 'PDF Р В Р’В»Р Р†Р вЂљРІвЂћвЂ“Р вЂ™Р’В¤Р В РЎВР РЋРІвЂћСћР СћРІР‚ВР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В Р’В»Р Р†Р вЂљРЎС™Р РЋРЎв„ў', viewDemo: 'Р В Р’В»Р В Р Р‰Р вЂ™Р’В°Р В Р’В»Р В РІР‚С›Р В Р С“ Р В Р’В»Р РЋРІР‚вЂњР СћРІР‚ВР В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°' },
    about: { description: 'Р В Р’В»Р Р†Р вЂљРЎв„ўР СћРІР‚В Р В РЎВР Р†Р вЂљРІР‚СњР вЂ™Р’В¬Р В РЎВР вЂ™Р’В Р Р†Р вЂљРЎС›, Р В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°Р В РЎВР Р†РІР‚С™Р’В¬Р вЂ™Р’В , Р В РЎВР вЂ™Р’В°Р В РІР‚В¦Р В РЎВР РЋРІР‚С”Р Р†Р вЂљР’ВР В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ў Р В Р’В»Р В Р вЂ°Р В РІР‚С™Р В Р вЂ¦Р Р†Р вЂљРЎС›Р РЋРЎв„ў Р В РЎВР Р†Р вЂљРІР‚СњР СћРІР‚ВР В РЎВР вЂ™Р’В Р Р†Р вЂљРЎС›Р В РЎВР РЋРЎС™Р Р†Р вЂљРЎвЂє Р В РЎВР Р†Р вЂљРЎС›Р В Р вЂ°Р В РЎВР Р†Р вЂљРЎС›Р Р†Р вЂљРЎвЂєР В Р’В»Р РЋРІР‚вЂњР СћРІР‚ВР В РЎВР Р†Р вЂљРЎвЂєР РЋРІР‚ВР В РЎВР РЋРІвЂћСћР Р†Р вЂљРЎСљ.' },
    gallery: { description: 'Р В Р вЂ¦Р Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂєР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎВР вЂ™Р’В Р РЋРЎС™Р В Р вЂ¦Р В РІР‚В°Р РЋРІР‚В, Р В РЎВР Р†Р вЂљРЎв„ўР вЂ™Р’В¬Р В РЎВР вЂ™Р’В§Р Р†Р вЂљРЎвЂє, Р В РЎВР вЂ™Р’В°Р В РІР‚В¦Р В РЎВР РЋРЎС™Р вЂ™Р’ВР В РЎВР вЂ™Р’В Р В РЎвЂњ Р В Р вЂ¦Р РЋРІР‚СљР РЋРІР‚в„ўР В Р вЂ¦Р Р†Р вЂљРІР‚СњР вЂ™Р’ВР В РЎВР РЋРЎС™Р Р†Р вЂљРЎвЂє Р В Р вЂ¦Р Р†Р вЂљР’В Р вЂ™Р’ВµР В Р вЂ¦Р Р†Р вЂљРЎС›Р РЋРЎв„ў Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р РЋРЎв„ўР В РЎвЂќР вЂ™Р’В°Р В РЎвЂњР В РЎВР вЂ™Р’В Р В РЎвЂњ Р В РЎВР Р†Р вЂљРІР‚СњР вЂ™Р’В¬Р В РЎВР вЂ™Р’В Р Р†Р вЂљРЎС›.', allAlbums: 'Р В Р’В»Р В РІР‚С›Р В Р С“Р В Р’В»Р Р†Р вЂљРЎС™Р вЂ™Р’В  Р В РЎВР Р†Р вЂљРЎС›Р В Р С“Р В Р’В»Р В РІР‚В Р Р†Р вЂљРЎСљ' },
    search: { title: 'Р В РЎвЂќР В РІР‚В Р В РІР‚С™Р В РЎВР РЋРІР‚СљР Р†Р вЂљР’В°', subtitle: 'Р В Р’В»Р РЋРІР‚ВР Р†Р вЂљРЎСљР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎвЂќР вЂ™Р’В·Р РЋРІР‚В Р В РЎвЂќР В РІР‚В Р В Р вЂ°Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р РЋРЎв„ўР В Р’В»Р вЂ™Р’В¬Р РЋР’В, Р В РЎВР РЋРЎв„ўР Р†Р вЂљРЎвЂєР В Р вЂ¦Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤ Р В Р’В»Р вЂ™Р’В¬Р РЋРІР‚ВР В РЎВР Р†Р вЂљРЎвЂєР РЋРЎв„ў, Р В РЎвЂќР вЂ™Р’В°Р вЂ™Р’В¤Р В Р’В»Р РЋРЎСџР вЂ™Р’В¬Р В Р’В»Р вЂ™Р’В¦Р вЂ™Р’В¬ Р В РЎВР вЂ™Р’В Р Р†Р вЂљРЎвЂєР В РЎВР В РІР‚В Р СћРІР‚ВР В РЎВР Р†Р вЂљРІР‚СњР РЋРІР‚в„ўР В РЎВР Р†Р вЂљРЎвЂєР РЋРЎв„ў Р В Р’В»Р вЂ™Р’В¬Р СћРІР‚ВР В РЎВР Р†Р вЂљРІР‚СњР Р†Р вЂљР Р‹Р В РЎВР РЋРЎС™Р СћРІР‚ВР В Р’В»Р Р†Р вЂљРЎС™Р вЂ™Р’В  Р В РЎВР вЂ™Р’В°Р РЋРІР‚СћР В РЎвЂќР РЋРІР‚ВР вЂ™Р’В°', placeholder: 'Р В Р’В»Р В РІР‚С›Р В Р С“Р В Р’В»Р Р†Р вЂљРЎС™Р вЂ™Р’В  Р В РЎВР В РІР‚В¦Р вЂ™Р’ВР В Р вЂ¦Р Р†Р вЂљР’В¦Р РЋРІР‚в„ўР В РЎВР РЋРІР‚ВР вЂ™Р’В  Р В РЎвЂќР В РІР‚В Р В РІР‚С™Р В РЎВР РЋРІР‚СљР Р†Р вЂљР’В°...', allContent: 'Р В Р’В»Р В РІР‚С›Р В Р С“Р В Р’В»Р Р†Р вЂљРЎС™Р вЂ™Р’В  Р В РЎВР В РІР‚В¦Р вЂ™Р’ВР В Р вЂ¦Р Р†Р вЂљР’В¦Р РЋРІР‚в„ўР В РЎВР РЋРІР‚ВР вЂ™Р’В ', results: 'Р В РЎвЂќР В РІР‚В Р вЂ™Р’В°Р В РЎвЂќР РЋРІР‚вЂњР РЋР’В' },
    stats: { blogPosts: 'Р В Р’В»Р РЋРІР‚ВР Р†Р вЂљРЎСљР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎвЂќР вЂ™Р’В·Р РЋРІР‚В Р В РЎвЂќР В РІР‚В Р В Р вЂ°Р В РЎВР Р†Р вЂљРІвЂћвЂ“Р РЋРЎв„ўР В Р’В»Р вЂ™Р’В¬Р РЋР’В', wikiArticles: 'Р В РЎВР РЋРЎв„ўР Р†Р вЂљРЎвЂєР В Р вЂ¦Р Р†Р вЂљРЎв„ўР вЂ™Р’В¤ Р В Р’В»Р вЂ™Р’В¬Р РЋРІР‚ВР В РЎВР Р†Р вЂљРЎвЂєР РЋРЎв„ў', galleryImages: 'Р В РЎВР РЋРЎС™Р СћРІР‚ВР В Р’В»Р В РІР‚РЋР РЋРІР‚ВР В РЎВР вЂ™Р’В§Р В РІР‚С™', projects: 'Р В Р вЂ¦Р Р†Р вЂљРЎСљР Р†Р вЂљРЎвЂєР В Р’В»Р В Р вЂ№Р РЋРЎв„ўР В РЎВР вЂ™Р’В Р РЋРЎС™Р В Р вЂ¦Р В РІР‚В°Р РЋРІР‚В' },
  },
};

const themeOptions = [
  { id: 'default', name: 'Frutiger Aero', icon: 'Р РЋР вЂљР РЋРЎСџР В Р вЂ°Р РЋРІР‚вЂќ' },
  { id: 'vaporwave', name: 'Vaporwave', icon: 'Р РЋР вЂљР РЋРЎСџР В Р вЂ°Р СћРІР‚В' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: 'Р В Р вЂ Р РЋРІвЂћСћР В Р вЂ№' },
  { id: 'skeuomorphism', name: 'Skeuomorphism', icon: 'Р РЋР вЂљР РЋРЎСџР Р†Р вЂљРЎС™Р вЂ™Р’В±' },
  { id: 'pcb', name: 'PCB Circuit', icon: 'Р РЋР вЂљР РЋРЎСџР Р†Р вЂљРЎСљР В Р вЂ°' },
] as const;


function buildView(post: ContentItem): BlogPostView {
  const plain = stripMarkdown(post.content);
  const excerpt = (post as any).excerpt || plain.slice(0, 180) + (plain.length > 180 ? 'Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦' : '');
  const words = plain.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.round(words / 180))} min read`;

  return {
    ...post,
    excerpt,
    readingTime,
    html: markdownToHtml(post.content),
  };
}

function sectionToPath(section: Section): string {
  switch (section) {
    case 'home':
      return `${basePath}`;
    case 'blog':
      return `${basePath}blog`;
    case 'about':
      return `${basePath}about`;
    case 'wiki':
      return `${basePath}wiki`;
    case 'cv':
      return `${basePath}cv`;
    case 'gallery':
      return `${basePath}gallery`;
    case 'search':
      return `${basePath}search`;
    case 'apps':
      return `${basePath}apps`;
    case 'news':
      return `${basePath}news`;
    case 'project':
      return `${basePath}about/projects`;
    default:
      return basePath;
  }
}

export function BlogSite() {
  const { language, setLanguage } = useApp();
  const ui = uiTexts[language] || uiTexts.en;

  const { byTag: projectsByTag } = useProjects();
  const { byTag: galleryByTag } = useGallery();
  const { news: newsItems } = useNews();

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('site-theme') || 'default');
  const [posts, setPosts] = useState<BlogPostView[]>([]);
  const [wiki, setWiki] = useState<WikiView[]>([]);
  const [pictures, setPictures] = useState<ImageItem[]>([]);
  const [projects, setProjects] = useState<ContentItem[]>([]);
  const [aboutMe, setAboutMe] = useState<ContentItem | null>(null);
  const [legalNotice, setLegalNotice] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<BlogPostView | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [activeWiki, setActiveWiki] = useState<WikiView | null>(null);
  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);
  const [activeProject, setActiveProject] = useState<ContentItem | null>(null);
  const [wikiCategory, setWikiCategory] = useState<string>('All');
  const [wikiSearch, setWikiSearch] = useState('');
  const [wikiCategoryIndex, setWikiCategoryIndex] = useState<ContentItem | null>(null);
  const [heroKey, setHeroKey] = useState(0);
  const [mainAboutTab, setMainAboutTab] = useState<'about' | 'cv' | 'projects' | 'legal'>('about');
  const [activeCvTab, setActiveCvTab] = useState<'it' | 'education' | 'gamedev' | 'rewards'>('it');
  const [lightbox, setLightbox] = useState<{ id: string; idx: number } | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [blogPage, setBlogPage] = useState(1);
  const [wikiPage, setWikiPage] = useState(1);
  const [galleryPage, setGalleryPage] = useState(1);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppEntry | null>(null);
  const [iframeHeight, setIframeHeight] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedWikiCategories, setExpandedWikiCategories] = useState<Set<string>>(new Set());
  const [expandedGalleryAlbums, setExpandedGalleryAlbums] = useState<Set<string>>(new Set());
  const itemsPerPage = 12;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
    setHeroKey((k) => k + 1); // Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚Сњ Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚В Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“
  }, [theme]);

  // Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В° iframe
  // Р В Р’В Р Р†Р вЂљРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° index Р В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В wikiCategory
  useEffect(() => {
    if (wikiCategory === 'All') {
      setWikiCategoryIndex(null);
      return;
    }

    loadWikiCategoryIndex(wikiCategory, language)
      .then(index => setWikiCategoryIndex(index))
      .catch(err => console.error('Failed to load category index:', err));
  }, [wikiCategory, language]);

  // Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В  Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚Сћ Р В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’В Р В Р Р‹Р В РЎвЂњР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋР’В Р В Р’В Р В РІР‚В  markdown
  useEffect(() => {
    const handleWikiLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('[data-wiki-link]') as HTMLElement;
      
      if (link) {
        e.preventDefault();
        const wikiLink = link.getAttribute('data-wiki-link');
        
        if (wikiLink) {
          // Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’В Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°Р В Р Р‹Р В РІР‚в„– Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р Р‹Р РЋРІР‚Сљ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В
          const targetArticle = wiki.find(article => {
            // Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ
            const fileName = wikiLink.replace('.md', '');
            return article.id === fileName || 
                   article.relativePath?.endsWith(wikiLink) ||
                   article.relativePath?.endsWith(fileName + '.md');
          });

          if (targetArticle) {
            handleOpenWiki(targetArticle);
          } else {
            console.warn('Wiki article not found:', wikiLink);
          }
        }
      }
    };

    document.addEventListener('click', handleWikiLinkClick);
    return () => document.removeEventListener('click', handleWikiLinkClick);
  }, [wiki]);

  useEffect(() => {
    if (!isResizing) {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return; // Double check
      
      // Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚Сљ Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В Р В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚В
      const iframe = document.querySelector('[data-iframe-container]');
      if (!iframe) return;
      
      const rect = iframe.getBoundingClientRect();
      const newHeight = Math.max(400, e.clientY - rect.top);
      setIframeHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);


  useEffect(() => {
    let mounted = true;
    Promise.all([
      loadArticles(language),
      loadWikiArticles(undefined, language),
      // Domain-layer gallery loader (replaces legacy loadPictures)
      loadPictureItems(),
      loadAllProjects(language),
      loadAboutMe(language),
      loadLegalNotice(language),
    ]).then(([loadedPosts, loadedWiki, loadedGalleryItems, loadedProjects, loadedAboutMe, loadedLegalNotice]) => {
      // Map GalleryItem[] Р В Р вЂ Р Р†Р вЂљР’В Р Р†Р вЂљРІвЂћСћ ImageItem[] shape for downstream picture state
      const loadedPics: ImageItem[] = (loadedGalleryItems as any[]).map((g) => ({
        id: g.id,
        name: g.title,
        path: g.imagePath ?? g.content,
        thumbnail: g.thumbnailPath,
        date: g.date,
      }));
      if (!mounted) return;
      const mapped = loadedPosts.map(buildView);
      const mappedWiki = loadedWiki.map((item) => ({
        ...item,
        excerpt: stripMarkdown(item.content).slice(0, 200) + (item.content.length > 200 ? 'Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В¦' : ''),
        html: markdownToHtml(item.content),
        categoryPath: item.category || item.pathSegments?.join('/') || 'wiki',
      }));
      
      setPosts(mapped);
      setWiki(mappedWiki);
      setPictures(loadedPics.slice(0, 12));
      setProjects(loadedProjects);
      setAboutMe(loadedAboutMe);
      setLegalNotice(loadedLegalNotice);
      setLoading(false);
      
      // Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ў, Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦ Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ў
      setActivePost(prev => {
        if (!prev) return null;
        const updated = mapped.find(p => p.id === prev.id);
        // Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В·Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’ВР В Р’В Р РЋР’В Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ў, Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ React Р В Р’В Р РЋРІР‚вЂњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р РЋРІР‚СљР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В» Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ
        return updated ? { ...updated } : null;
      });
      
      // Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚в„– wiki Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР’В Р В Р Р‹Р РЋРІР‚Сљ, Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°
      setActiveWiki(prev => {
        if (!prev) return null;
        const updated = mappedWiki.find(w => w.id === prev.id);
        // Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В·Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’ВР В Р’В Р РЋР’В Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ў, Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ React Р В Р’В Р РЋРІР‚вЂњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р РЋРІР‚СљР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В» Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ
        return updated ? { ...updated } : null;
      });
      
      // Р В Р’В Р РЋРІР‚С”Р В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ў, Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦ Р В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ў
      setActiveProject(prev => {
        if (!prev) return null;
        const updated = loadedProjects.find(p => p.id === prev.id);
        // Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В·Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’ВР В Р’В Р РЋР’В Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ў, Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ React Р В Р’В Р РЋРІР‚вЂњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р РЋРІР‚СљР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В» Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ
        return updated ? { ...updated } : null;
      });
      
      syncFromLocation(window.location.pathname, mapped, mappedWiki);
    });
    return () => {
      mounted = false;
    };
  }, [language]); // Р В Р’В Р РЋРЎСџР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚В Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’В·Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°

  useEffect(() => {
    syncFromLocation(window.location.pathname, posts, wiki);
  }, [posts, wiki]);

  useEffect(() => {
    let mounted = true;
    loadAppEntries(language).then((loaded) => {
      if (!mounted) return;
      setApps(loaded);
      setSelectedApp((prev) => {
        if (prev) {
          const match = loaded.find((app) => app.id === prev.id);
          return match ?? loaded[0] ?? null;
        }
        return loaded[0] ?? null;
      });
    });
    return () => {
      mounted = false;
    };
  }, [language]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    posts.forEach((p) => p.category && unique.add(p.category));
    return ['All', ...Array.from(unique)];
  }, [posts]);


  const allTags = useMemo(() => {
    const unique = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((tag) => unique.add(tag)));
    wiki.forEach((w) => w.tags?.forEach((tag) => unique.add(tag)));
    return Array.from(unique).sort();
  }, [posts, wiki]);

  const appsByCategory = useMemo(() => {
    const mapping: Record<AppCategoryId, AppEntry[]> = {
      ready: [],
      prototype: [],
      'webos-emulation': [],
    };
    apps.forEach((app) => {
      const category = (app.category || 'ready') as AppCategoryId;
      if (!mapping[category]) {
        mapping[category] = [];
      }
      mapping[category].push(app);
    });
    return mapping;
  }, [apps]);

  // Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ Wiki
  const wikiCategoryTree = useMemo(() => {
    interface CategoryNode {
      name: string;
      fullPath: string;
      children: Map<string, CategoryNode>;
      count: number;
    }

    const root = new Map<string, CategoryNode>();

    wiki.forEach((w) => {
      const segments = w.pathSegments || (w.categoryPath ? w.categoryPath.split('/') : []);
      if (segments.length === 0) return;

      let currentMap = root;
      let currentPath = '';

      segments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        
        if (!currentMap.has(segment)) {
          currentMap.set(segment, {
            name: segment,
            fullPath: currentPath,
            children: new Map(),
            count: 0,
          });
        }

        const node = currentMap.get(segment)!;
        node.count++;
        currentMap = node.children;
      });
    });

    return root;
  }, [wiki]);

  const wikiCategories = useMemo(() => {
    return ['All', ...Array.from(wikiCategoryTree.keys())];
  }, [wikiCategoryTree]);

  const wikiCategoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    wikiCategoryTree.forEach((node, key) => {
      counts[key] = node.count;
    });
    return counts;
  }, [wikiCategoryTree]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        stripMarkdown(post.content).toLowerCase().includes(query);
      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  const filteredWiki = useMemo(() => {
    return wiki.filter((item) => {
      const itemPath = item.pathSegments ? item.pathSegments.join('/') : item.categoryPath;
      const matchesCategory = wikiCategory === 'All' || itemPath.startsWith(wikiCategory);
      const q = wikiSearch.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        stripMarkdown(item.content).toLowerCase().includes(q) ||
        itemPath.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [wiki, wikiCategory, wikiSearch]);

  // Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В  Gallery (Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ Wiki)
  const galleryAlbumTree = useMemo(() => {
    interface AlbumNode {
      name: string;
      fullPath: string;
      children: Map<string, AlbumNode>;
      count: number;
    }

    const root = new Map<string, AlbumNode>();

    pictures.forEach((pic) => {
      // Р В Р’В Р вЂ™Р’ВР В Р’В Р вЂ™Р’В·Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р’В Р РЋРІР‚Сњ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В· URL Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ
      // Р В Р’В Р вЂ™Р’В¤Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ў: /assets/picture-hash.jpg Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ, Р В Р’В Р В РІР‚В¦Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В¶Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° pic.id Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р СћРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’Вµ
      const pathParts = pic.path.split('/');
      const picturesIndex = pathParts.findIndex(part => part === 'pictures');
      
      if (picturesIndex === -1 || picturesIndex === pathParts.length - 1) {
        // Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ў Р В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РІР‚С™Р В Р Р‹Р РЋРІР‚СљР В Р’В Р РЋРІР‚СњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚Сњ, Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В°Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р В РІР‚В  General
        if (!root.has('General')) {
          root.set('General', {
            name: 'General',
            fullPath: 'General',
            children: new Map(),
            count: 0,
          });
        }
        root.get('General')!.count++;
        return;
      }

      // Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’Вµ pictures/
      const segments = pathParts.slice(picturesIndex + 1, -1); // Р В Р’В Р В РІвЂљВ¬Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’ВР В Р Р‹Р В Р РЏ Р В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р вЂ™Р’В°Р В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’В°
      
      if (segments.length === 0) {
        if (!root.has('General')) {
          root.set('General', {
            name: 'General',
            fullPath: 'General',
            children: new Map(),
            count: 0,
          });
        }
        root.get('General')!.count++;
        return;
      }

      let currentMap = root;
      let currentPath = '';

      segments.forEach((segment) => {
        currentPath = currentPath ? `${currentPath}/${segment}` : segment;
        
        if (!currentMap.has(segment)) {
          currentMap.set(segment, {
            name: segment,
            fullPath: currentPath,
            children: new Map(),
            count: 0,
          });
        }

        const node = currentMap.get(segment)!;
        node.count++;
        currentMap = node.children;
      });
    });

    return root;
  }, [pictures]);

  const galleryAlbums = useMemo(() => {
    return Array.from(galleryAlbumTree.keys());
  }, [galleryAlbumTree]);

  const filteredGalleryImages = useMemo(() => {
    if (!selectedAlbum) return pictures;
    
    return pictures.filter((pic) => {
      const pathParts = pic.path.split('/');
      const picturesIndex = pathParts.findIndex(part => part === 'pictures');
      
      if (picturesIndex === -1) return false;
      
      const segments = pathParts.slice(picturesIndex + 1, -1);
      const picPath = segments.join('/');
      
      // Р В Р’В Р РЋРЎСџР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚В Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚Сћ Р В Р’В Р РЋРІР‚вЂќР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚В
      return picPath === selectedAlbum || picPath.startsWith(selectedAlbum + '/');
    });
  }, [pictures, selectedAlbum]);

  const paginatedBlog = useMemo(() => {
    const start = (blogPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, blogPage, itemsPerPage]);

  const paginatedWiki = useMemo(() => {
    const start = (wikiPage - 1) * itemsPerPage;
    return filteredWiki.slice(start, start + itemsPerPage);
  }, [filteredWiki, wikiPage, itemsPerPage]);

  const paginatedGallery = useMemo(() => {
    const start = (galleryPage - 1) * itemsPerPage;
    return filteredGalleryImages.slice(start, start + itemsPerPage);
  }, [filteredGalleryImages, galleryPage, itemsPerPage]);

  const totalBlogPages = Math.ceil(filtered.length / itemsPerPage);
  const totalWikiPages = Math.ceil(filteredWiki.length / itemsPerPage);
  const totalGalleryPages = Math.ceil(filteredGalleryImages.length / itemsPerPage);

  const latestPosts = posts.slice(0, 3);
  const statCards = [
    { label: 'Р В Р’В Р В Р вЂ№Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњ', value: posts.length, icon: BookOpen, accent: 'bg-aero-sky/30' },
    { label: 'Wiki Р В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’В°Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚Сњ', value: wiki.length, icon: FileText, accent: 'bg-aero-sun/30' },
    { label: 'Р В Р’В Р вЂ™Р’ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ', value: pictures.length, icon: ImageIcon, accent: 'bg-aero-water/30' },
  ];


  function syncFromLocation(pathname: string, postsList: BlogPostView[], wikiList: WikiView[]) {
    const rest = pathname.replace(basePath, '').replace(/^\/+/, '');
    if (!rest) {
      setActiveSection('home');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'blog') {
      setActiveSection('blog');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'about') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'wiki') {
      setActiveSection('wiki');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'cv') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'gallery') {
      setActiveSection('gallery');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'apps') {
      setActiveSection('apps');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'search') {
      setActiveSection('search');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest === 'news') {
      setActiveSection('news');
      setActivePost(null);
      setActiveWiki(null);
      setActiveNews(null);
      return;
    }
    if (rest.startsWith('news/')) {
      const newsId = decodeURIComponent(rest.replace(/^news\//, '').replace(/\.md$/, ''));
      setActiveSection('news');
      setActivePost(null);
      setActiveWiki(null);
      // activeNews will be set by handleOpenNews once newsItems are loaded
      // Store id in history state so we can restore it
      if (newsItems.length > 0) {
        const matchNews = newsItems.find((n) => n.id === newsId);
        setActiveNews(matchNews ?? null);
      }
      return;
    }
    if (rest.startsWith('wiki/')) {
      const wikiSlug = decodeURIComponent(rest.replace(/^wiki\//, '').replace(/\.md$/, ''));
      const matchWiki = wikiList.find((w) => w.relativePath?.replace(/\.md$/, '') === wikiSlug);
      if (matchWiki) {
        setActiveSection('wiki');
        setActiveWiki(matchWiki);
        setActivePost(null);
        setActiveNews(null);
        return;
      }
    }
    const cleaned = rest.startsWith('blog/') ? rest.replace(/^blog\//, '') : rest;
    const slug = cleaned.replace(/\.md$/, '');
    const maybePost = postsList.find((p) => p.id === slug);
    if (maybePost) {
      setActiveSection('home');
      setActivePost(maybePost);
      setActiveWiki(null);
      setActiveNews(null);
    }
  }

  const handleOpenPost = (post: BlogPostView) => {
    setActivePost(post);
    setActiveWiki(null);
    setActiveNews(null);
    window.history.pushState({}, '', `${basePath}blog/${post.id}.md`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateSection = (section: NavSection) => {
    setActiveSection(section);
    setActivePost(null);
    setActiveWiki(null);
    setActiveNews(null);
    window.history.pushState({}, '', sectionToPath(section));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWiki = (item: WikiView) => {
    setActiveSection('wiki');
    setActiveWiki(item);
    setActiveNews(null);
    window.history.pushState({}, '', `${basePath}wiki/${item.relativePath?.replace(/\.md$/, '')}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNews = (item: NewsItem) => {
    setActiveSection('news');
    setActiveNews(item);
    setActivePost(null);
    setActiveWiki(null);
    window.history.pushState({}, '', `${basePath}news/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPicture = (idx: number, id: string) => {
    setLightbox({ idx, id });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox(null);
    document.body.style.overflow = '';
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="neu px-4 py-2 rounded-xl bg-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          Р В Р вЂ Р Р†Р вЂљР’В Р РЋРІР‚в„ў
        </button>
        {pages.map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-4 py-2 rounded-xl transition-colors ${
                currentPage === page
                  ? 'neu-sm bg-primary text-primary-foreground'
                  : 'neu bg-card hover:bg-muted'
              }`}
            >
              {page}
            </button>
          )
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="neu px-4 py-2 rounded-xl bg-card disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          Р В Р вЂ Р Р†Р вЂљР’В Р Р†Р вЂљРІвЂћСћ
        </button>
      </div>
    );
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightbox) return;
    const count = pictures.length;
    if (count === 0) return;
    const nextIdx = direction === 'next' ? (lightbox.idx + 1) % count : (lightbox.idx - 1 + count) % count;
    setLightbox({ idx: nextIdx, id: pictures[nextIdx].id });
  };

  const cv = loadCvLocale(language);

  return (
    <div className="min-h-screen text-foreground">
      <Navigation
        activeSection={(activeSection === 'cv' || activeSection === 'project') ? 'about' : activeSection as NavSection}
        onNavigate={navigateSection}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        themeOptions={themeOptions as any}
        navLabels={ui.nav}
      />

      {activeSection === 'home' && (
        <Hero key={heroKey} title={ui.heroTitle} subtitle={ui.heroSubtitle} />
      )}

      {activeSection === 'home' && !activePost && (
        <>
          {/* Explore My World Section */}
          <section className="container mx-auto px-6 py-24">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="gradient-text">{ui.sections.explore}</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {ui.sections.exploreSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { key: 'about', title: ui.nav.about, description: ui.about.description, icon: User, gradient: 'bg-aero-sky' },
                { key: 'blog', title: ui.nav.blog, description: ui.blog.description, icon: BookOpen, gradient: 'bg-aero-grass' },
                { key: 'wiki', title: ui.nav.wiki, description: ui.wiki.description, icon: FileText, gradient: 'bg-aero-sun' },
                { key: 'gallery', title: ui.nav.gallery, description: ui.gallery.description, icon: ImageIcon, gradient: 'bg-aero-water' },
                { key: 'apps', title: ui.nav.apps, description: ui.apps?.subtitle || '', icon: Grid3x3, gradient: 'bg-aero-cloud' },
              ].map((section, index) => (
                <div
                  key={section.key}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <SectionCard
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    gradient={section.gradient}
                    onClick={() => navigateSection(section.key as NavSection)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Latest Blog Posts */}
          {latestPosts.length > 0 && (
            <section className="container mx-auto px-6 py-24">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{ui.latestPosts.title}</h2>
                  <p className="text-muted-foreground">{ui.latestPosts.subtitle}</p>
                </div>
                <button
                  onClick={() => navigateSection('blog')}
                  className="flex items-center gap-2 text-primary hover:gap-4 transition-all font-medium"
                >
                  {ui.latestPosts.viewAll} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {latestPosts.map((post, index) => (
                  <ContentCard
                    key={post.id}
                    item={post}
                    onClick={() => handleOpenPost(post)}
                    index={index}
                    animationClass="fade-in-up"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Latest News Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ vertical slice from src/content/news */}
          <NewsSection
            limit={3}
            onOpenNews={(item) => handleOpenNews(item as NewsItem)}
            onViewAll={() => navigateSection('news')}
          />

          {/* Selected Projects */}
          <ProjectsSection
            limit={3}
            onViewAll={() => {
              setActiveSection('about');
              setMainAboutTab('projects');
              window.history.pushState({}, '', `${basePath}about/projects`);
            }}
          />

          {/* Gallery Preview */}
          <GallerySection
            limit={4}
            onViewAll={() => {
              setActiveSection('gallery');
              setGalleryPage(1);
              window.history.pushState({}, '', `${basePath}gallery`);
            }}
          />

          {/* CTA Section */}
          <section className="container mx-auto px-6 py-24">
            <div className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-aero-sky/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-aero-grass/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  {ui.cta.letsCreate} <span className="gradient-text">{ui.cta.together}</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  {ui.cta.description}
                </p>
                <button
                  onClick={() => navigateSection('about')}
                  className="inline-flex items-center gap-2 neu px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform"
                >
                  {ui.cta.getInTouch} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {activeSection === 'blog' && !activePost && (
        <ArticlesSection
          labels={{
            title: ui.blog.title,
            subtitle: ui.blog.subtitle,
            searchPlaceholder: ui.searchPlaceholder,
            loading: ui.loading,
            nothing: ui.nothing,
          }}
          loading={loading}
          paginatedPosts={paginatedBlog}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentPage={blogPage}
          totalPages={totalBlogPages}
          onPageChange={setBlogPage}
          onOpenPost={handleOpenPost}
        />
      )}

      {/* Blog Post Detail View */}
      {(activeSection === 'home' || activeSection === 'blog') && activePost && (
        <ArticleDetailSection
          activePost={activePost}
          language={language}
          labels={{
            back: ui.back,
            tags: ui.tags,
            blogLabel: ui.nav.blog,
          }}
          onBack={() => {
            setActivePost(null);
            window.history.pushState({}, '', activeSection === 'blog' ? `blog` : basePath);
          }}
          onTagClick={(tag) => {
            setActivePost(null);
            setActiveSection('search');
            setGlobalSearchQuery(tag);
            window.history.pushState({}, '', `search`);
          }}
          tagCounts={
            activePost.tags
              ? Object.fromEntries(
                  activePost.tags.map((tag) => [
                    tag,
                    posts.filter((p) => p.tags?.includes(tag)).length +
                      wiki.filter((w) => w.tags?.includes(tag)).length +
                      projects.filter((pr) => pr.tags?.includes(tag)).length,
                  ])
                )
              : {}
          }
        />
      )}

      {/* Project Detail View */}
      {activeSection === 'project' && activeProject && (
        <main className="pt-32 pb-24" key={`project-${activeProject.id}-${language}`}>
          <div className="container mx-auto px-6">
            <section className="max-w-4xl mx-auto">
              <div className="glass rounded-3xl p-6 md:p-10 neu-sm animate-fade-in">
                <button
                  onClick={() => {
                    setActiveProject(null);
                    setActiveSection('about');
                    setMainAboutTab('projects');
                    window.history.pushState({}, '', `${basePath}about`);
                  }}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {ui.back}
                </button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-medium text-foreground">{ui.projectsTitle}</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                  <span className="text-foreground">{activeProject.title}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  {activeProject.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {activeProject.date}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {activeProject.category || 'Other'}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-8">{activeProject.title}</h2>

                {activeProject.preview && (
                  <div className="mb-8 rounded-2xl overflow-hidden neu-sm">
                    {activeProject.preview.endsWith('.webm') || activeProject.preview.endsWith('.mp4') ? (
                      <video 
                        src={activeProject.preview} 
                        className="w-full h-auto"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={activeProject.preview} 
                        alt={activeProject.title}
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(activeProject.content) }}
                />

                {activeProject.tags && activeProject.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className="text-muted-foreground font-medium">{ui.tags}:</span>
                    {activeProject.tags.map((tag) => {
                      const tagCount = posts.filter((p) => p.tags?.includes(tag)).length + 
                                       wiki.filter((w) => w.tags?.includes(tag)).length +
                                       projects.filter((pr) => pr.tags?.includes(tag)).length;
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            setActiveProject(null);
                            setActiveSection('search');
                            setGlobalSearchQuery(tag);
                            window.history.pushState({}, '', `${basePath}search`);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <span className="text-xs opacity-70">
                            ({tagCount})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      )}

      {activeSection === 'about' && (
        <AboutSection
          ui={ui}
          language={language}
          aboutMe={aboutMe}
          legalNotice={legalNotice}
          projects={projects}
          posts={posts}
          wiki={wiki}
          mainAboutTab={mainAboutTab}
          setMainAboutTab={setMainAboutTab}
          activeCvTab={activeCvTab}
          setActiveCvTab={setActiveCvTab}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setActiveProject={setActiveProject}
          setActiveSection={setActiveSection}
          setGlobalSearchQuery={setGlobalSearchQuery}
          basePath={basePath}
        />
      )}

      {activeSection === 'apps' && ui.apps && (
        <section className="w-full px-6 py-12 space-y-8">
          <div className="max-w-6xl mx-auto space-y-2">
            <div className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {ui.apps.subtitle}
            </div>
            <h2 className="text-4xl font-bold">{ui.apps.title}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl">{ui.apps.selectPrompt}</p>
          </div>

          <div className="space-y-6">
            {/* Iframe Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В° Р В Р’В Р В РІР‚В Р В Р Р‹Р В РЎвЂњР В Р Р‹Р В РІР‚в„– Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р Р‹Р РЋРІР‚Сљ Р В Р Р‹Р В Р Р‰Р В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В° */}
            <div className="w-full">
              <div className="glass rounded-3xl border border-border neu-sm overflow-hidden" data-iframe-container>
                {selectedApp ? (
                  <>
                    <div className="relative w-full overflow-hidden bg-background" style={{ height: `${iframeHeight}px` }}>
                      {selectedApp.url ? (
                        <iframe
                          title={selectedApp.iframeTitle ?? selectedApp.title}
                          src={selectedApp.url}
                          className="absolute inset-0 h-full w-full border-0"
                          loading="lazy"
                          sandbox="allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          No preview available
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2 z-10">
                        {(selectedApp.badges || []).map((badge) => (
                          <span
                            key={badge}
                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full bg-primary text-primary-foreground shadow-lg"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Resize handle */}
                    <div 
                      className="relative h-10 bg-gradient-to-b from-border/20 via-border/40 to-border/60 cursor-ns-resize hover:bg-primary/20 transition-all group select-none"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsResizing(true);
                      }}
                      title="Р В Р’В Р РЋРЎСџР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р РЏР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏ Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“"
                    >
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-foreground font-bold">
                            Р В Р’В Р вЂ™Р’ВР В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ° Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В·Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™
                          </div>
                          <div className="flex gap-1.5">
                            <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                            <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                            <div className="w-10 h-1 rounded-full bg-foreground/60"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">Loading apps...</div>
                )}
              </div>
            </div>

            {/* Р В Р’В Р РЋРІР‚С”Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚В Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’В¶Р В Р’В Р вЂ™Р’Вµ - Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р Р†Р вЂљР Р‹Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚Сћ Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ */}
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
                {/* Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚В Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В»Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° */}
                <div className="space-y-4">
                {APP_CATEGORIES.map((category) => {
                  const items = appsByCategory[category] || [];
                  const label = (ui.apps?.categories as any)?.[category] || category;
                  return (
                    <div key={category} className="glass rounded-2xl border border-border p-4 neu-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold">{label}</h3>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em]">{items.length}</span>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Soon.</p>
                      ) : (
                        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                          {items.map((app) => {
                            const isActive = selectedApp?.id === app.id;
                            return (
                              <button
                                key={app.id}
                                type="button"
                                className={`w-full text-left rounded-xl border transition-all duration-200 px-3 py-2 ${
                                  isActive
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                    : 'border-border/60 bg-card/50 hover:border-primary/60 hover:bg-card'
                                }`}
                                onClick={() => setSelectedApp(app)}
                              >
                                <div className="font-semibold text-sm">{app.title}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">{app.date || 'Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ'}</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Р В Р’В Р РЋРІР‚С”Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚вЂќР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В° */}
              {selectedApp && (
                <div className="glass rounded-3xl border border-border p-6 neu-sm space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-2xl font-bold text-foreground">{selectedApp.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedApp.description || selectedApp.content || 'Description is missing.'}
                      </p>
                    </div>
                    {selectedApp.url && (
                      <button
                        type="button"
                        onClick={() => window.open(selectedApp.url, '_blank', 'noreferrer')}
                        className="neu px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform whitespace-nowrap"
                      >
                        {language === 'ru' ? 'Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РІР‚С™Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В Р вЂ°' : 'Open Full'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-border/50">
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {ui.apps?.dateLabel || 'Date'}
                      </div>
                      <div className="text-sm font-semibold text-foreground">{selectedApp.date || 'Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ'}</div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {ui.apps?.platformsLabel || 'Platforms'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedApp.platforms || selectedApp.platforms.length === 0) ? (
                          <span className="text-sm text-muted-foreground">Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ</span>
                        ) : (
                          selectedApp.platforms.map((platform) => (
                            <span key={platform} className="px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold">
                              {platform}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {language === 'ru' ? 'Р В Р’В Р РЋРЎвЂєР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В' : 'Technologies'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedApp.technologies || selectedApp.technologies.length === 0) ? (
                          <span className="text-sm text-muted-foreground">Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ</span>
                        ) : (
                          selectedApp.technologies.map((tech) => (
                            <span key={tech} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                              {tech}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold">
                        {ui.apps?.badgesLabel || 'Tags'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedApp.badges || selectedApp.badges.length === 0) ? (
                          <span className="text-sm text-muted-foreground">Р В Р вЂ Р В РІР‚С™Р Р†Р вЂљРЎСљ</span>
                        ) : (
                          selectedApp.badges.map((badge) => (
                            <span key={badge} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                              {badge}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'wiki' && (
        <WikiSection
          ui={ui}
          language={language}
          wikiCategories={wikiCategories}
          wikiCategoryStats={wikiCategoryStats}
          wikiCategoryTree={wikiCategoryTree as any}
          expandedWikiCategories={expandedWikiCategories}
          setExpandedWikiCategories={setExpandedWikiCategories}
          wikiCategory={wikiCategory}
          setWikiCategory={setWikiCategory}
          wikiSearch={wikiSearch}
          setWikiSearch={setWikiSearch}
          activeWiki={activeWiki}
          setActiveWiki={setActiveWiki}
          wikiCategoryIndex={wikiCategoryIndex}
          paginatedWiki={paginatedWiki}
          wikiPage={wikiPage}
          totalWikiPages={totalWikiPages}
          setWikiPage={setWikiPage}
          getTagCount={(tag) =>
            posts.filter((p) => p.tags?.includes(tag)).length +
            wiki.filter((w) => w.tags?.includes(tag)).length +
            projects.filter((pr) => pr.tags?.includes(tag)).length
          }
          handleOpenWiki={handleOpenWiki}
          setActiveSection={setActiveSection}
          setGlobalSearchQuery={setGlobalSearchQuery}
          basePath={basePath}
        />
      )}

      {activeSection === 'cv' && (
        <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <h2 className="text-3xl font-bold">{ui.cvTitle}</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {(['it', 'education', 'gamedev', 'rewards'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCvTab(tab)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeCvTab === tab ? 'neu-sm bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => window.print()}
                className="neu px-4 py-2 rounded-xl bg-card hover:bg-primary/10 transition-colors flex items-center gap-2"
              >
                <span>Print</span>
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'cv.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="neu px-4 py-2 rounded-xl bg-primary text-primary-foreground flex items-center gap-2"
              >
                <span>Download JSON</span>
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 neu-sm fade-in-up">
            <h3 className="text-2xl font-semibold mb-4 capitalize">{activeCvTab}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {(cv?.[activeCvTab] || []).map((item: any, idx: number) => (
                <div key={idx} className="bg-card rounded-2xl p-4 border border-border card-hover">
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    {item.year && <span>{item.year}</span>}
                    {item.subtitle && <span>Р В РІР‚в„ўР вЂ™Р’В· {item.subtitle}</span>}
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {item.details?.map((d: string, di: number) => {
                      // Р В Р’В Р РЋРЎСџР В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚С™Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚ВР В Р’В Р РЋР’В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р Р‹Р Р†Р вЂљР’В¦Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂњР В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В Р В Р’В Р В РІР‚В  Р В Р Р‹Р Р†Р вЂљРЎвЂєР В Р’В Р РЋРІР‚СћР В Р Р‹Р В РІР‚С™Р В Р’В Р РЋР’ВР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’Вµ ^category^tech^
                      const parts: (string | JSX.Element)[] = [];
                      let lastIndex = 0;
                      const regex = /\^([^\^]+)\^([^\^]+)\^/g;
                      let match;
                      
                      while ((match = regex.exec(d)) !== null) {
                        // Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ў Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р СћРІР‚В Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В
                        if (match.index > lastIndex) {
                          parts.push(d.substring(lastIndex, match.index));
                        }
                        
                        const category = match[1];
                        const tech = match[2];
                        
                        // Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В¶
                        parts.push(
                          <span
                            key={`${di}-${match.index}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors mx-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSection('search');
                              setGlobalSearchQuery(tech);
                              window.history.pushState({}, '', `${basePath}search`);
                            }}
                          >
                            <span className="text-[10px] opacity-70">{category}</span>
                            <span className="font-medium">{tech}</span>
                          </span>
                        );
                        
                        lastIndex = match.index + match[0].length;
                      }
                      
                      // Р В Р’В Р Р†Р вЂљРЎСљР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р РЏР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋР’В Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р Р‹Р Р†РІР‚С™Р’В¬Р В Р’В Р РЋРІР‚ВР В Р’В Р Р†РІР‚С›РІР‚вЂњР В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р РЏ Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р В РЎвЂњР В Р Р‹Р Р†Р вЂљРЎв„ў
                      if (lastIndex < d.length) {
                        parts.push(d.substring(lastIndex));
                      }
                      
                      return <li key={di}>{parts.length > 0 ? parts : d}</li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {activeCvTab === 'gamedev' && (cv as any)?.prototypes && (
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">Game Prototypes</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {(cv as any).prototypes.map((proto: any, index: number) => (
                  <div
                    key={proto.title || index}
                    className="neu rounded-3xl overflow-hidden bg-card card-hover"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-video bg-gradient-hero relative flex items-center justify-center">
                      <Play className="w-10 h-10 text-primary-foreground/50" />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-2">{proto.title || 'Prototype'}</h4>
                      <p className="text-muted-foreground text-sm mb-4">{proto.description || 'Demo'}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(proto.tech || []).map((t: string) => (
                          <span key={t} className="px-2 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {activeSection === 'gallery' && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">{ui.galleryTitle}</h2>
          {pictures.length === 0 ? (
            <div className="text-muted-foreground">{ui.loading}</div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_3fr] gap-6">
              {/* Р В Р’В Р Р†Р вЂљР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В Р РЏ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’ВµР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ° Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’В°Р В Р’В Р В РІР‚В Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚вЂњР В Р’В Р вЂ™Р’В°Р В Р Р‹Р Р†Р вЂљР’В Р В Р’В Р РЋРІР‚ВР В Р’В Р РЋРІР‚В */}
              <aside className="glass rounded-2xl p-4 neu-sm self-start">
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Folder className="w-4 h-4 text-primary" />
                  <span>{language === 'ru' ? 'Р В Р’В Р РЋРІР‚в„ўР В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“' : 'Albums'}</span>
                </div>
                <div className="space-y-2">
                  {/* Р В Р’В Р РЋРІвЂћСћР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СњР В Р’В Р вЂ™Р’В° "Р В Р’В Р Р†Р вЂљРІвЂћСћР В Р Р‹Р В РЎвЂњР В Р’В Р вЂ™Р’Вµ Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р Р‹Р Р†Р вЂљРІвЂћвЂ“" */}
                  <button
                    onClick={() => {
                      setSelectedAlbum(null);
                      setGalleryPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      !selectedAlbum
                        ? 'neu-sm bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span>{ui.gallery.allAlbums}</span>
                    <span className="text-xs text-muted-foreground">{pictures.length}</span>
                  </button>

                  {/* Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚ВР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚Сњ Р В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В  Р В Р Р‹Р В РЎвЂњ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚С™Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р’В Р Р†РІР‚С›РІР‚вЂњ */}
                  {galleryAlbums.map((albumName) => {
                    const albumNode = galleryAlbumTree.get(albumName);
                    if (!albumNode) return null;
                    
                    const subalbums = Array.from(albumNode.children.entries());
                    const hasSubalbums = subalbums.length > 0;
                    const isExpanded = expandedGalleryAlbums.has(albumName);
                    
                    // Р В Р’В Р вЂ™Р’В Р В Р’В Р вЂ™Р’ВµР В Р’В Р РЋРІР‚СњР В Р Р‹Р РЋРІР‚СљР В Р Р‹Р В РІР‚С™Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В»Р В Р Р‹Р В Р вЂ°Р В Р’В Р вЂ™Р’В±Р В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’ВР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В 
                    const renderSubalbums = (subalbs: [string, any][], level: number = 1): JSX.Element => {
                      return (
                        <>
                          {subalbs.map(([subName, subNode]) => {
                            const subPath = subNode.fullPath;
                            const hasChildren = subNode.children && subNode.children.size > 0;
                            const isSubExpanded = expandedGalleryAlbums.has(subPath);
                            
                            return (
                              <div key={subPath} className="space-y-1">
                                <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 8}px` }}>
                                  {hasChildren && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newExpanded = new Set(expandedGalleryAlbums);
                                        if (isSubExpanded) {
                                          newExpanded.delete(subPath);
                                        } else {
                                          newExpanded.add(subPath);
                                        }
                                        setExpandedGalleryAlbums(newExpanded);
                                      }}
                                      className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                                    >
                                      {isSubExpanded ? (
                                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                      )}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      setSelectedAlbum(subPath);
                                      setGalleryPage(1);
                                    }}
                                    className={`flex-1 flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-all ${
                                      selectedAlbum === subPath ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    } ${!hasChildren ? 'ml-4' : ''}`}
                                  >
                                    <span>{subName}</span>
                                    <span className="text-xs opacity-60">{subNode.count}</span>
                                  </button>
                                </div>
                                {hasChildren && isSubExpanded && (
                                  <div className="space-y-1">
                                    {renderSubalbums(Array.from(subNode.children.entries()), level + 1)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      );
                    };
                    
                    return (
                      <div key={albumName} className="space-y-1">
                        <div className="flex items-center gap-1">
                          {hasSubalbums && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newExpanded = new Set(expandedGalleryAlbums);
                                if (isExpanded) {
                                  newExpanded.delete(albumName);
                                } else {
                                  newExpanded.add(albumName);
                                }
                                setExpandedGalleryAlbums(newExpanded);
                              }}
                              className="p-1 hover:bg-muted rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedAlbum(albumNode.fullPath);
                              setGalleryPage(1);
                            }}
                            className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                              selectedAlbum === albumNode.fullPath
                                ? 'neu-sm bg-primary/10 text-primary'
                                : 'hover:bg-muted text-foreground'
                            } ${!hasSubalbums ? 'ml-5' : ''}`}
                          >
                            <span>{albumName}</span>
                            <span className="text-xs text-muted-foreground">{albumNode.count}</span>
                          </button>
                        </div>
                        {hasSubalbums && isExpanded && (
                          <div className="ml-4 space-y-1">
                            {renderSubalbums(subalbums)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>

              {/* Р В Р’В Р РЋРІР‚С”Р В Р Р‹Р В РЎвЂњР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚СћР В Р’В Р Р†РІР‚С›РІР‚вЂњ Р В Р’В Р РЋРІР‚СњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р Р‹Р Р†Р вЂљРЎв„ў */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {paginatedGallery.map((pic) => (
                    <button
                      key={pic.id}
                      className="relative overflow-hidden rounded-2xl neu card-hover aspect-square"
                      onClick={() => handleOpenPicture(filteredGalleryImages.indexOf(pic), pic.id)}
                    >
                      <img src={pic.path} alt={pic.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity p-3 text-white text-xs flex items-end">
                        <div className="font-medium">{pic.name}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <Pagination currentPage={galleryPage} totalPages={totalGalleryPages} onPageChange={setGalleryPage} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* News Full Section */}
      {activeSection === 'news' && (
        <NewsPageSection
          ui={ui}
          language={language}
          activeNews={activeNews}
          setActiveNews={setActiveNews}
          setActiveSection={setActiveSection}
          setGlobalSearchQuery={setGlobalSearchQuery}
          handleOpenNews={handleOpenNews}
          basePath={basePath}
        />
      )}

      {lightbox && pictures[lightbox.idx] && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 neu p-3 rounded-xl bg-card z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 neu p-3 rounded-xl bg-card z-10"
            aria-label="Previous"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 neu p-3 rounded-xl bg-card z-10"
            aria-label="Next"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div
            className="max-w-5xl max-h-[80vh] w-full mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gradient-hero rounded-3xl neu flex items-center justify-center overflow-hidden">
              <img
                src={pictures[lightbox.idx].path}
                alt={pictures[lightbox.idx].name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 text-center text-muted-foreground">{pictures[lightbox.idx].name}</div>
          </div>
        </div>
      )}

      {/* Search Page */}
      {activeSection === 'search' && (
        <main className="pt-32 pb-24">
          <div className="container mx-auto px-6">
            {/* Header */}
            <section className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                <span className="gradient-text">{ui.search.title}</span>
              </h1>
              <p className="text-xl text-muted-foreground animate-fade-in animation-delay-100">
                {ui.search.subtitle}
              </p>
            </section>

            {/* Search Input */}
            <section className="max-w-4xl mx-auto mb-12">
              <div className="glass rounded-3xl p-6 md:p-8 neu-sm fade-in-up">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={ui.search.placeholder}
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 text-lg rounded-2xl bg-card border border-border focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Search Results */}
            <section className="max-w-6xl mx-auto">
              {(() => {
                const query = globalSearchQuery.toLowerCase().trim();
                if (!query) {
                  return (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">{ui.search.allContent}</p>
                    </div>
                  );
                }

                const blogResults = posts.filter(
                  (p) =>
                    p.title.toLowerCase().includes(query) ||
                    p.excerpt.toLowerCase().includes(query) ||
                    p.tags?.some((t) => t.toLowerCase().includes(query))
                );
                const wikiResults = wiki.filter(
                  (w) =>
                    w.title.toLowerCase().includes(query) ||
                    w.excerpt.toLowerCase().includes(query)
                );
                const galleryResults = (() => {
                  const tagMatches = galleryByTag.get(query);
                  if (tagMatches && tagMatches.length > 0) {
                    const matchIds = new Set(tagMatches.map((item) => item.id.replace('picture__', '')));
                    return pictures.filter((pic) => matchIds.has(pic.id));
                  }
                  return pictures.filter(
                    (pic) => pic.name.toLowerCase().includes(query)
                  );
                })();
                const projectResults = (() => {
                  const tagMatches = projectsByTag.get(query);
                  if (tagMatches && tagMatches.length > 0) {
                    const matchIds = new Set(tagMatches.map((p) => p.id));
                    return projects.filter((p) => matchIds.has(p.id));
                  }
                  return projects.filter(
                    (pr) =>
                      pr.title.toLowerCase().includes(query) ||
                      pr.content.toLowerCase().includes(query) ||
                      pr.tags?.some((t) => t.toLowerCase().includes(query))
                  );
                })();

                const totalResults = blogResults.length + wikiResults.length + galleryResults.length + projectResults.length;

                if (totalResults === 0) {
                  return (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">{ui.nothing}</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-12">
                    <div className="text-center mb-8">
                      <p className="text-muted-foreground">
                        {totalResults} {ui.search.results}
                      </p>
                    </div>

                    {/* Blog Results */}
                    {blogResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <BookOpen className="w-6 h-6" />
                          {ui.nav.blog} ({blogResults.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {blogResults.map((post) => (
                            <article
                              key={post.id}
                              className="neu rounded-2xl overflow-hidden bg-card card-hover cursor-pointer"
                              onClick={() => {
                                setActivePost(post);
                                setActiveSection('blog');
                                window.history.pushState({}, '', `${basePath}blog/${post.id}.md`);
                              }}
                            >
                              <div className="aspect-video bg-gradient-hero relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <BookOpen className="w-12 h-12 text-primary-foreground/50" />
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="text-lg font-bold mb-2">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Wiki Results */}
                    {wikiResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <FileText className="w-6 h-6" />
                          {ui.nav.wiki} ({wikiResults.length})
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          {wikiResults.map((item) => (
                            <article
                              key={item.relativePath}
                              className="glass rounded-2xl p-4 neu-sm hover:cursor-pointer hover:-translate-y-1 transition-transform"
                              onClick={() => {
                                setActiveWiki(item);
                                setActiveSection('wiki');
                                window.history.pushState({}, '', `${basePath}wiki/${item.relativePath!.replace(/\.md$/, '')}`);
                              }}
                            >
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <FileText className="w-4 h-4" />
                                <span>{item.categoryPath || 'wiki'}</span>
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gallery Results */}
                    {galleryResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <ImageIcon className="w-6 h-6" />
                          {ui.nav.gallery} ({galleryResults.length})
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {galleryResults.map((pic) => (
                            <button
                              key={pic.id}
                              className="relative overflow-hidden rounded-xl neu card-hover aspect-square"
                              onClick={() => handleOpenPicture(pictures.indexOf(pic), pic.id)}
                            >
                              <img src={pic.path} alt={pic.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Results */}
                    {projectResults.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <Briefcase className="w-6 h-6" />
                          {ui.projectsTitle} ({projectResults.length})
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {projectResults.map((project) => (
                            <article
                              key={project.id}
                              className="neu rounded-2xl overflow-hidden bg-card card-hover cursor-pointer"
                              onClick={() => {
                                setActiveProject(project);
                                setActiveSection('project');
                                window.history.pushState({}, '', `/site/about/projects/${project.id}`);
                              }}
                            >
                              <div className="aspect-video bg-gradient-hero relative overflow-hidden">
                                {project.preview ? (
                                  project.preview.endsWith('.webm') || project.preview.endsWith('.mp4') ? (
                                    <video 
                                      src={project.preview} 
                                      className="w-full h-full object-cover"
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                    />
                                  ) : (
                                    <img 
                                      src={project.preview} 
                                      alt={project.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )
                                ) : (
                                  <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                                    <Briefcase className="w-10 h-10 text-primary-foreground/50" />
                                  </div>
                                )}
                              </div>
                              <div className="p-6">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                    {project.category}
                                  </span>
                                  {project.date && <span>Р В РІР‚в„ўР вЂ™Р’В· {project.date}</span>}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">{project.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3">
                                  {stripMarkdown(project.content).slice(0, 150)}...
                                </p>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>

            {/* Tags Cloud */}
            <section className="max-w-6xl mx-auto mt-24">
              <div className="glass rounded-3xl p-8 neu-sm">
                <h2 className="text-2xl font-bold mb-6 text-center">{ui.tags}</h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setGlobalSearchQuery(tag)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <span className="text-xs opacity-70">
                        ({posts.filter((p) => p.tags?.includes(tag)).length + wiki.filter((w) => w.tags?.includes(tag)).length})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
