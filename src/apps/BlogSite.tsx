import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Filter,
  Search,
  Image as ImageIcon,
  Tag,
  User,
  FileText,
  Briefcase,
  Layers,
  Compass,
  Sparkles,
  Play,
  X,
} from 'lucide-react';
import {
  loadBlogPosts,
  loadWikiArticles,
  loadPictures,
  type ContentItem,
  type ImageItem,
} from '../utils/contentLoader';
import { translations, type Language } from '../i18n/translations';
import { useApp } from '../contexts/AppContext';
import cvRaw from '../content/cv/cv-data.json';
import { aboutContent } from '../content/projects/projects';
import { WeatherSwitcher } from '../components/WeatherSwitcher';
import { Navigation } from '../components/Navigation';
import { SectionCard } from '../components/SectionCard';
import { Footer } from '../components/Footer';

type Section = 'home' | 'about' | 'wiki' | 'cv' | 'gallery';
type NavSection = Section | 'blog';

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

type UiText = {
  nav: Record<Section | 'blog', string>;
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
};

const basePath = '/site/';

const languageOptions: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const uiTexts: Record<Language, UiText> = {
  en: {
    nav: { home: 'Home', about: 'About', wiki: 'Wiki', cv: 'CV', gallery: 'Gallery', blog: 'Blog' },
    heroTitle: 'Creative Developer Space',
    heroSubtitle: 'Aura port: themes, language switch, sections and markdown posts.',
    searchPlaceholder: 'Search articles...',
    categories: 'Categories',
    tags: 'Tags',
    loading: 'Loading...',
    nothing: 'Nothing found.',
    back: 'Back',
    nowReading: 'Reading now',
    galleryTitle: 'Gallery',
    wikiTitle: 'Wiki highlights',
    cvTitle: 'Experience & Education',
    aboutTitle: 'About me',
  },
  ru: {
    nav: { home: 'Главная', about: 'Обо мне', wiki: 'Вики', cv: 'Резюме', gallery: 'Галерея', blog: 'Блог' },
    heroTitle: 'Пространство разработчика',
    heroSubtitle: 'Полный перенос Aura: темы, язык, разделы и markdown-статьи.',
    searchPlaceholder: 'Поиск по статьям...',
    categories: 'Категории',
    tags: 'Теги',
    loading: 'Загрузка...',
    nothing: 'Ничего не найдено.',
    back: 'Назад',
    nowReading: 'Читаю сейчас',
    galleryTitle: 'Галерея',
    wikiTitle: 'Статьи wiki',
    cvTitle: 'Опыт и образование',
    aboutTitle: 'Обо мне',
  },
  fr: {
    nav: { home: 'Accueil', about: 'À propos', wiki: 'Wiki', cv: 'CV', gallery: 'Galerie', blog: 'Blog' },
    heroTitle: 'Espace de développeur créatif',
    heroSubtitle: 'Portage Aura : thèmes, langue, sections et articles markdown.',
    searchPlaceholder: 'Rechercher des articles...',
    categories: 'Catégories',
    tags: 'Tags',
    loading: 'Chargement...',
    nothing: 'Rien trouvé.',
    back: 'Retour',
    nowReading: 'En lecture',
    galleryTitle: 'Galerie',
    wikiTitle: 'Articles wiki',
    cvTitle: 'Expérience et études',
    aboutTitle: 'À propos',
  },
  es: {
    nav: { home: 'Inicio', about: 'Sobre mí', wiki: 'Wiki', cv: 'CV', gallery: 'Galería', blog: 'Blog' },
    heroTitle: 'Espacio de desarrollador creativo',
    heroSubtitle: 'Port completo de Aura: temas, idioma, secciones y artículos markdown.',
    searchPlaceholder: 'Buscar artículos...',
    categories: 'Categorías',
    tags: 'Etiquetas',
    loading: 'Cargando...',
    nothing: 'Nada encontrado.',
    back: 'Atrás',
    nowReading: 'Leyendo',
    galleryTitle: 'Galería',
    wikiTitle: 'Artículos wiki',
    cvTitle: 'Experiencia y educación',
    aboutTitle: 'Sobre mí',
  },
  zh: {
    nav: { home: '首页', about: '关于', wiki: '维基', cv: '简历', gallery: '画廊', blog: '博客' },
    heroTitle: '创意开发者空间',
    heroSubtitle: '完整的 Aura 迁移：主题、语言、分区与 markdown 文章。',
    searchPlaceholder: '搜索文章...',
    categories: '分类',
    tags: '标签',
    loading: '加载中...',
    nothing: '未找到内容。',
    back: '返回',
    nowReading: '正在阅读',
    galleryTitle: '画廊',
    wikiTitle: 'Wiki 文章',
    cvTitle: '经验与教育',
    aboutTitle: '关于',
  },
  ja: {
    nav: { home: 'ホーム', about: '概要', wiki: 'ウィキ', cv: '履歴書', gallery: 'ギャラリー', blog: 'ブログ' },
    heroTitle: 'クリエイティブ開発者スペース',
    heroSubtitle: 'Aura の完全移植：テーマ・言語・セクション・Markdown記事。',
    searchPlaceholder: '記事を検索...',
    categories: 'カテゴリ',
    tags: 'タグ',
    loading: '読み込み中...',
    nothing: '見つかりません。',
    back: '戻る',
    nowReading: '閲覧中',
    galleryTitle: 'ギャラリー',
    wikiTitle: 'Wiki 記事',
    cvTitle: '経験と学歴',
    aboutTitle: '概要',
  },
  ko: {
    nav: { home: '홈', about: '소개', wiki: '위키', cv: '이력서', gallery: '갤러리', blog: '블로그' },
    heroTitle: '크리에이티브 개발 공간',
    heroSubtitle: 'Aura 전체 이식: 테마, 언어, 섹션, markdown 글.',
    searchPlaceholder: '기사 검색...',
    categories: '카테고리',
    tags: '태그',
    loading: '로드 중...',
    nothing: '검색 결과 없음.',
    back: '뒤로',
    nowReading: '읽는 중',
    galleryTitle: '갤러리',
    wikiTitle: '위키 글',
    cvTitle: '경력과 교육',
    aboutTitle: '소개',
  },
};

const themeOptions = [
  { id: 'default', name: 'Frutiger Aero', icon: '🌿' },
  { id: 'vaporwave', name: 'Vaporwave', icon: '🌴' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '⚡' },
  { id: 'skeuomorphism', name: 'Skeuomorphism', icon: '📱' },
] as const;

function stripMarkdown(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[[^\]]+]\(([^)]+)\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownToHtml(md: string): string {
  const escapeHtml = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const fenced = md.replace(/```([\s\S]*?)```/g, (_, code) => {
    const safe = escapeHtml(code.trim());
    return `<pre class="bg-muted rounded-xl p-4 overflow-auto text-sm"><code>${safe}</code></pre>`;
  });

  const lines = fenced
    .split('\n')
    .map((line) => {
      if (/^#{3}\s+/.test(line)) {
        return `<h3 class="text-xl font-semibold mb-3 mt-6">${line.replace(/^#{3}\s+/, '')}</h3>`;
      }
      if (/^#{2}\s+/.test(line)) {
        return `<h2 class="text-2xl font-bold mb-4 mt-8">${line.replace(/^#{2}\s+/, '')}</h2>`;
      }
      if (/^#\s+/.test(line)) {
        return `<h1 class="text-3xl font-bold mb-4 mt-10">${line.replace(/^#\s+/, '')}</h1>`;
      }
      if (/^\s*[-*+]\s+/.test(line)) {
        return `<li class="mb-2">${line.replace(/^\s*[-*+]\s+/, '')}</li>`;
      }
      return `<p class="mb-4 text-muted-foreground leading-relaxed">${line}</p>`;
    })
    .join('\n');

  const inline = lines
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-sm">$1</code>')
    .replace(/!\[([^\]]*)]\(([^)]+)\)/g, '<img alt="$1" src="$2" class="my-4 rounded-xl" />')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a class="wiki-link" href="$2" target="_blank" rel="noreferrer">$1</a>');

  return inline.replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="list-disc list-inside text-muted-foreground mb-4">$1</ul>');
}

function buildView(post: ContentItem): BlogPostView {
  const plain = stripMarkdown(post.content);
  const excerpt = (post as any).excerpt || plain.slice(0, 180) + (plain.length > 180 ? '…' : '');
  const words = plain.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.max(1, Math.round(words / 180))} min read`;

  return {
    ...post,
    excerpt,
    readingTime,
    html: markdownToHtml(post.content),
  };
}

function sectionToPath(section: NavSection): string {
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
    default:
      return basePath;
  }
}

export function BlogSite() {
  const { language, setLanguage } = useApp();
  const ui = uiTexts[language] || uiTexts.en;

  const [theme, setTheme] = useState<string>(() => localStorage.getItem('site-theme') || 'default');
  const [posts, setPosts] = useState<BlogPostView[]>([]);
  const [wiki, setWiki] = useState<WikiView[]>([]);
  const [pictures, setPictures] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<BlogPostView | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeWiki, setActiveWiki] = useState<WikiView | null>(null);
  const [wikiCategory, setWikiCategory] = useState<string>('All');
  const [wikiSearch, setWikiSearch] = useState('');
  const [heroKey, setHeroKey] = useState(0);
  const [mainAboutTab, setMainAboutTab] = useState<'about' | 'cv'>('about');
  const [activeCvTab, setActiveCvTab] = useState<'it' | 'education' | 'gamedev' | 'rewards'>('it');
  const [lightbox, setLightbox] = useState<{ id: string; idx: number } | null>(null);
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
    setHeroKey((k) => k + 1); // перезапуск анимаций при смене темы
  }, [theme]);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadBlogPosts(), loadWikiArticles(), loadPictures()]).then(([loadedPosts, loadedWiki, loadedPics]) => {
      if (!mounted) return;
      const mapped = loadedPosts.map(buildView);
      setPosts(mapped);
      setActivePost(null);
      setWiki(
        loadedWiki.map((item) => ({
          ...item,
          excerpt: stripMarkdown(item.content).slice(0, 200) + (item.content.length > 200 ? '…' : ''),
          html: markdownToHtml(item.content),
          categoryPath: item.category || item.pathSegments?.join('/') || 'wiki',
        }))
      );
      setPictures(loadedPics.slice(0, 12));
      setLoading(false);
      syncFromLocation(window.location.pathname, mapped, loadedWiki);
    });
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    syncFromLocation(window.location.pathname, posts, wiki);
  }, [posts, wiki]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    posts.forEach((p) => p.category && unique.add(p.category));
    return ['All', ...Array.from(unique)];
  }, [posts]);

  const tags = useMemo(() => {
    const unique = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((tag) => unique.add(tag)));
    return Array.from(unique);
  }, [posts]);

  const wikiCategories = useMemo(() => {
    const unique = new Set<string>();
    wiki.forEach((w) => {
      if (w.categoryPath) {
        const parts = w.categoryPath.split('/');
        if (parts[0]) unique.add(parts[0]);
      }
    });
    return ['All', ...Array.from(unique)];
  }, [wiki]);

  const wikiCategoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    wiki.forEach((w) => {
      const cat = w.categoryPath?.split('/')[0] || 'wiki';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [wiki]);

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
      const matchesCategory = wikiCategory === 'All' || item.categoryPath.startsWith(wikiCategory);
      const q = wikiSearch.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        stripMarkdown(item.content).toLowerCase().includes(q) ||
        item.categoryPath.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [wiki, wikiCategory, wikiSearch]);

  const latestPosts = posts.slice(0, 3);
  const statCards = [
    { label: 'Статей', value: posts.length, icon: BookOpen, accent: 'bg-aero-sky/30' },
    { label: 'Wiki заметок', value: wiki.length, icon: FileText, accent: 'bg-aero-sun/30' },
    { label: 'Изображений', value: pictures.length, icon: ImageIcon, accent: 'bg-aero-water/30' },
  ];

  const handleShare = (post: BlogPostView) => {
    const url = `${window.location.origin}${basePath}blog/${post.id}.md`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      alert('Ссылка скопирована в буфер обмена');
    } else {
      prompt('Скопируйте ссылку', url);
    }
  };

  const toggleBookmark = (post: BlogPostView) => {
    setBookmarkMap((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
  };

  function syncFromLocation(pathname: string, postsList: BlogPostView[], wikiList: WikiView[]) {
    const rest = pathname.replace(basePath, '').replace(/^\/+/, '');
    if (!rest) {
      setActiveSection('home');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'blog') {
      setActiveSection('blog');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'about') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'wiki') {
      setActiveSection('wiki');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'cv') {
      setActiveSection('about');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest === 'gallery') {
      setActiveSection('gallery');
      setActivePost(null);
      setActiveWiki(null);
      return;
    }
    if (rest.startsWith('wiki/')) {
      const wikiSlug = decodeURIComponent(rest.replace(/^wiki\//, '').replace(/\.md$/, ''));
      const matchWiki = wikiList.find((w) => w.relativePath?.replace(/\.md$/, '') === wikiSlug);
      if (matchWiki) {
        setActiveSection('wiki');
        setActiveWiki(matchWiki);
        setActivePost(null);
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
    }
  }

  const handleOpenPost = (post: BlogPostView) => {
    setActivePost(post);
    setActiveWiki(null);
    window.history.pushState({}, '', `${basePath}blog/${post.id}.md`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateSection = (section: NavSection) => {
    setActiveSection(section);
    setActivePost(null);
    setActiveWiki(null);
    window.history.pushState({}, '', sectionToPath(section));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenWiki = (item: WikiView) => {
    setActiveSection('wiki');
    setActiveWiki(item);
    window.history.pushState({}, '', `${basePath}wiki/${item.relativePath}`);
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

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightbox) return;
    const count = pictures.length;
    if (count === 0) return;
    const nextIdx = direction === 'next' ? (lightbox.idx + 1) % count : (lightbox.idx - 1 + count) % count;
    setLightbox({ idx: nextIdx, id: pictures[nextIdx].id });
  };

  const cv = (cvRaw as any)[language] || (cvRaw as any).en;
  const about = aboutContent[language] || aboutContent.en;

  return (
    <div className="min-h-screen text-foreground">
      <Navigation
        activeSection={activeSection}
        onNavigate={navigateSection}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        themeOptions={themeOptions as any}
      />

      <section className="relative overflow-hidden">
        <div className="parallax-container">
          <div className="parallax-layer parallax-bg bg-gradient-hero opacity-70" />
          <div className="parallax-layer parallax-mid">
            <div className="absolute top-16 left-12 w-64 h-64 rounded-full bg-aero-sky/30 blur-3xl animate-float" />
            <div className="absolute top-32 right-24 w-80 h-80 rounded-full bg-aero-grass/25 blur-3xl animate-float animation-delay-200" />
          </div>
        </div>
        <div key={heroKey} className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-10 text-center fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mt-6 mb-4 gradient-text animation-delay-100 fade-in-up">
            {ui.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animation-delay-200 fade-in-up">
            {ui.heroSubtitle}
          </p>
        </div>
      </section>

      {activeSection === 'home' && (
        <>
          <section className="max-w-6xl mx-auto px-6 -mt-2 pb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: 'home', title: ui.nav.blog, desc: 'Статьи из markdown', icon: BookOpen, gradient: 'bg-aero-sky' },
                { key: 'blog', title: 'Blog', desc: 'Полный список постов', icon: BookOpen, gradient: 'bg-aero-sky' },
                { key: 'wiki', title: ui.nav.wiki, desc: 'Заметки и конспекты', icon: FileText, gradient: 'bg-aero-sun' },
                { key: 'cv', title: ui.nav.cv, desc: 'Опыт и образование', icon: Briefcase, gradient: 'bg-accent' },
                { key: 'gallery', title: ui.nav.gallery, desc: 'Галерея изображений', icon: ImageIcon, gradient: 'bg-aero-water' },
              ].map((card) => (
                <SectionCard
                  key={card.key}
                  title={card.title}
                  description={card.desc}
                  icon={card.icon}
                  gradient={card.gradient}
                  onClick={() => navigateSection(card.key as NavSection)}
                />
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-6 -mt-6">
            <div className="glass rounded-3xl p-6 md:p-8 neu-sm fade-in-up">
              <div className="grid gap-4 md:grid-cols-[2fr_1fr] items-center">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={ui.searchPlaceholder}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-5 h-5" />
                    <span>{ui.categories}:</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedCategory === category
                            ? 'neu-sm bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                {tags.length > 0 && (
                  <div className="md:col-span-2 flex flex-wrap gap-2 items-center">
                    <span className="text-muted-foreground text-sm">{ui.tags}:</span>
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedTag === tag
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-6 py-10">
            {loading ? (
              <div className="text-center text-muted-foreground">{ui.loading}</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground">{ui.nothing}</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((post, index) => (
                  <article
                    key={post.id}
                    className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                    onClick={() => handleOpenPost(post)}
                  >
                    <div className="aspect-video bg-gradient-hero relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-sm text-foreground">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full glass">
                          {post.category || 'General'}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="w-4 h-4" />
                          {post.date || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-3 text-foreground">{post.title}</h2>
                      <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readingTime}
                        </span>
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {activePost && (
            <section className="max-w-5xl mx-auto px-6 pb-16">
              <div className="glass rounded-3xl p-6 md:p-10 neu-sm animate-fade-in">
                <button
                  onClick={() => {
                    setActivePost(null);
                    window.history.pushState({}, '', basePath);
                  }}
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {ui.back}
                </button>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium text-foreground">{ui.nav.blog}</span>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                  <span className="text-foreground">{activePost.title}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {activePost.date || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {activePost.readingTime}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {activePost.category || 'General'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => handleShare(activePost)}
                    className="neu-sm px-4 py-2 rounded-xl bg-card hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                    <span>Поделиться</span>
                  </button>
                  <button
                    onClick={() => toggleBookmark(activePost)}
                    className={`neu-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                      bookmarkMap[activePost.id] ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
                    }`}
                  >
                    <span>{bookmarkMap[activePost.id] ? 'В закладках' : 'Сохранить'}</span>
                  </button>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-4">{activePost.title}</h2>
                <p className="text-lg text-muted-foreground mb-8">{activePost.excerpt}</p>

                <div
                  className="prose prose-lg max-w-none text-foreground markdown-body"
                  dangerouslySetInnerHTML={{ __html: activePost.html }}
                />

                {activePost.tags && activePost.tags.length > 0 && (
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className="text-muted-foreground font-medium">{ui.tags}:</span>
                    {activePost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {latestPosts.length > 0 && (
            <section className="max-w-6xl mx-auto px-6 py-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Posts</h2>
                  <p className="text-muted-foreground">Свежие заметки</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {latestPosts.map((post, index) => (
                  <article
                    key={post.id}
                    className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleOpenPost(post)}
                  >
                    <div className="aspect-video bg-gradient-hero relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-sm text-foreground">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full glass">
                          {post.category || 'General'}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <Calendar className="w-4 h-4" />
                          {post.date || '—'}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-foreground hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readingTime}
                        </span>
                        {post.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="max-w-6xl mx-auto px-6 py-16">
            <div className="glass rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-aero-sky/30 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-aero-grass/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Давай <span className="gradient-text">создавать</span> вместе
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Есть идея или проект? Свяжись — обсудим и сделаем.
                </p>
                <a
                  href={`${basePath}about`}
                  className="inline-flex items-center gap-2 neu px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:scale-105 transition-transform"
                >
                  Связаться <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </section>
        </>
      )}

      {activeSection === 'blog' && (
        <section className="max-w-6xl mx-auto px-6 py-10">
          {loading ? (
            <div className="text-center text-muted-foreground">{ui.loading}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground">{ui.nothing}</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, index) => (
                <article
                  key={post.id}
                  className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                  onClick={() => handleOpenPost(post)}
                >
                  <div className="aspect-video bg-gradient-hero relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-sm text-foreground">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full glass">
                        {post.category || 'General'}
                      </span>
                      <span className="flex items-center gap-1 text-xs">
                        <Calendar className="w-4 h-4" />
                        {post.date || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 text-foreground">{post.title}</h2>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readingTime}
                      </span>
                      {post.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeSection === 'about' && (
        <section className="max-w-6xl mx-auto px-6 py-12 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="glass rounded-2xl p-4 flex items-center gap-3 neu-sm fade-in-up"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl ${card.accent} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{card.label}</div>
                    <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative overflow-hidden glass rounded-3xl p-8 neu-sm fade-in-up">
            <div className="absolute inset-0 noise-overlay pointer-events-none" />
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-foreground/80 mb-4">{ui.aboutTitle}</p>
              <div className="flex flex-wrap gap-2 mb-4 items-center">
                <button
                  onClick={() => setMainAboutTab('about')}
                  className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                    mainAboutTab === 'about' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                  }`}
                >
                  About me
                </button>
                <span className="text-muted-foreground text-sm">CV (Резюме):</span>
                {(['it', 'education', 'gamedev', 'rewards'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setMainAboutTab('cv');
                      setActiveCvTab(tab);
                    }}
                    className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                      mainAboutTab === 'cv' && activeCvTab === tab ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {mainAboutTab === 'about' && (
                <>
                  <h2 className="text-4xl font-bold mb-3 gradient-text">{about.name}</h2>
                  <p className="text-lg text-primary font-semibold mb-4">{about.title}</p>
                  <p className="text-muted-foreground leading-relaxed mb-3">{about.bio}</p>
                  <p className="text-muted-foreground leading-relaxed">{about.description}</p>
                </>
              )}

              {mainAboutTab === 'cv' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {(cv?.[activeCvTab] || []).map((item: any, idx: number) => (
                      <div key={idx} className="bg-card rounded-2xl p-4 border border-border card-hover">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="font-semibold text-foreground">{item.title}</span>
                          {item.year && <span>{item.year}</span>}
                          {item.subtitle && <span>· {item.subtitle}</span>}
                        </div>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {item.details?.map((d: string, di: number) => (
                            <li key={di}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {activeCvTab === 'gamedev' && (cv as any)?.prototypes && (
                    <div className="mt-6">
                      <h3 className="text-2xl font-bold mb-4">Game Prototypes</h3>
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
                </>
              )}
              <div className="mt-8 flex flex-wrap gap-2">
                {Array.from(
                  new Set<string>([
                    ...posts.flatMap((p) => p.tags || []),
                    ...wiki.flatMap((w) => w.tags || []),
                  ]),
                ).map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'wiki' && (
        <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-foreground/80">
              <Layers className="w-4 h-4" />
              <span>{ui.wikiTitle}</span>
            </div>
            <div className="text-muted-foreground">Знания и заметки</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="w-4 h-4" />
              <span>{ui.categories}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {wikiCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setWikiCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    wikiCategory === cat ? 'neu-sm bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {`${cat}${cat !== 'All' && wikiCategoryStats[cat] ? ` (${wikiCategoryStats[cat]})` : ''}`}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80 ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={wikiSearch}
                onChange={(e) => setWikiSearch(e.target.value)}
                placeholder={ui.searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-card border border-border focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
            <aside className="glass rounded-2xl p-4 neu-sm self-start">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Layers className="w-4 h-4 text-primary" />
                <span>{ui.categories}</span>
              </div>
              <div className="space-y-2">
                {wikiCategories.map((cat) => {
                  const subItems = wiki.filter((w) => w.categoryPath?.startsWith(cat) && cat !== 'All');
                  return (
                    <div key={cat} className="space-y-1">
                      <button
                        onClick={() => setWikiCategory(cat)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                          wikiCategory === cat ? 'neu-sm bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span>{cat}</span>
                        {cat !== 'All' && wikiCategoryStats[cat] ? (
                          <span className="text-xs text-muted-foreground">{wikiCategoryStats[cat]}</span>
                        ) : null}
                      </button>
                      {cat !== 'All' && subItems.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {subItems.slice(0, 4).map((item) => (
                            <button
                              key={item.relativePath}
                              onClick={() => handleOpenWiki(item as WikiView)}
                              className="w-full text-left px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-6">
              {activeWiki && (
                <div className="glass rounded-3xl p-6 md:p-10 neu-sm fade-in-up">
                  <button
                    onClick={() => {
                      setActiveWiki(null);
                      window.history.pushState({}, '', `${basePath}wiki`);
                    }}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {ui.back}
                  </button>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="w-4 h-4" />
                      {activeWiki.categoryPath || 'wiki'}
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-60" />
                    <span className="font-medium text-foreground">{activeWiki.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                    <FileText className="w-4 h-4" />
                    <span>{activeWiki.categoryPath || 'wiki'}</span>
                    {activeWiki.updatedAt && <span>· {activeWiki.updatedAt}</span>}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{activeWiki.title}</h3>
                  <div className="prose prose-lg max-w-none text-foreground markdown-body" dangerouslySetInnerHTML={{ __html: activeWiki.html }} />
                </div>
              )}

              {!activeWiki && (
                <>
                  {filteredWiki.length === 0 ? (
                    <div className="text-muted-foreground">{ui.nothing}</div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredWiki.map((item) => (
                        <article
                          key={item.relativePath}
                          className="glass rounded-2xl p-4 neu-sm hover:cursor-pointer hover:-translate-y-1 transition-transform"
                          onClick={() => handleOpenWiki(item)}
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <FileText className="w-4 h-4" />
                            <span>{item.categoryPath || 'wiki'}</span>
                            {item.updatedAt && <span>· {item.updatedAt}</span>}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
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
                    {item.subtitle && <span>· {item.subtitle}</span>}
                  </div>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {item.details?.map((d: string, di: number) => (
                      <li key={di}>{d}</li>
                    ))}
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
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold">{ui.galleryTitle}</h2>
            <div className="text-muted-foreground">Категории и теги</div>
          </div>
          {pictures.length === 0 ? (
            <div className="text-muted-foreground">{ui.loading}</div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {['All', ...Array.from(new Set(pictures.map((p) => (p.path.split('/content/pictures/')[1] || p.id).split('/')[0] || 'General')))].map((cat) => (
                  <span
                    key={cat}
                    className="px-3 py-1.5 rounded-full text-xs bg-muted text-muted-foreground"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pictures.map((pic) => {
                  const nameParts = pic.name.split(/[-_]/).filter(Boolean);
                  return (
                    <button
                      key={pic.id}
                      className="relative overflow-hidden rounded-2xl neu card-hover text-left"
                      onClick={() => handleOpenPicture(pictures.indexOf(pic), pic.id)}
                    >
                      <img src={pic.path} alt={pic.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity p-2 text-white text-xs flex items-end">
                        <div>
                          <div>{pic.name}</div>
                          <div className="flex gap-1 flex-wrap">
                            {nameParts.slice(0, 3).map((t) => (
                              <span key={t} className="px-1 py-0.5 rounded bg-white/20">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>
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

      <Footer />
    </div>
  );
}
