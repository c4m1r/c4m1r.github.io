/**
 * ProjectsSection — site-shell widget for the home page.
 *
 * Reads projects from domain via useProjects() hook.
 * Displays up to `limit` latest items with an interactive category filter.
 * Language-aware. No OS wrapper classes — this is the site-shell view.
 */

import { useMemo, useState } from 'react';
import { Briefcase, ArrowRight, Tag, ExternalLink } from 'lucide-react';
import { useProjects } from '../../../domain/projects/useProjects';
import { useApp } from '../../../contexts/useApp';
import { type Project } from '../../../domain/projects/projects.types';

interface ProjectsSectionProps {
  /** Max items to show. Default 6. */
  limit?: number;
  /** Called when user clicks "View All". Optional. */
  onViewAll?: () => void;
  /** Called when user clicks a project card to view detail. Optional. */
  onOpenProject?: (project: Project) => void;
}

const ALL_PROJECTS_CATEGORY = '__all__';
const CATEGORY_ORDER = ['IT', 'Gamedev', 'Design', 'Web', 'Mobile', 'Other'];

const CATEGORY_EMOJI: Record<string, string> = {
  IT: '💻',
  Gamedev: '🎮',
  Design: '🎨',
  Web: '🌐',
  Mobile: '📱',
  Other: '📁',
};

function isVideoPreview(preview: string): boolean {
  return /\.(webm|mp4)(?:[?#].*)?$/i.test(preview);
}

function categoryEmoji(cat?: string): string {
  if (!cat) return '📁';
  return CATEGORY_EMOJI[cat] ?? CATEGORY_EMOJI[cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()] ?? '📁';
}

function categoryLabel(category: string, language: string): string {
  if (language === 'ru') {
    switch (category) {
      case 'IT':
        return 'IT-инфраструктура';
      case 'Gamedev':
        return 'Геймдев';
      case 'Design':
        return 'Дизайн';
      case 'Web':
        return 'Веб';
      case 'Mobile':
        return 'Мобильные';
      case 'Other':
        return 'Другое';
      default:
        return category;
    }
  }

  return category === 'IT' ? 'IT Infrastructure' : category;
}

export function ProjectsSection({ limit = 6, onViewAll, onOpenProject }: ProjectsSectionProps) {
  const { projects, loading } = useProjects();
  const { language } = useApp();
  const [activeCategory, setActiveCategory] = useState(ALL_PROJECTS_CATEGORY);

  const headingText = language === 'ru' ? 'Проекты' : 'Projects';
  const subtitleText =
    language === 'ru'
      ? 'Избранные работы, приложения и архитектурные исследования'
      : 'Selected works, applications, and architectural research';
  const viewAllText = language === 'ru' ? 'Все проекты' : 'View all';
  const loadingText = language === 'ru' ? 'Загрузка...' : 'Loading…';
  const noContentText =
    language === 'ru'
      ? 'Проекты появятся здесь'
      : 'Projects will appear here';
  const allCategoriesText = language === 'ru' ? 'Все' : 'All';
  const filterLabel = language === 'ru' ? 'Фильтр проектов по категории' : 'Filter projects by category';

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(projects.map((project) => project.category).filter((category): category is string => Boolean(category))),
    );

    return uniqueCategories.sort((left, right) => {
      const leftIndex = CATEGORY_ORDER.indexOf(left);
      const rightIndex = CATEGORY_ORDER.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    });
  }, [projects]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      if (!project.category) return;
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    });
    return counts;
  }, [projects]);

  const filteredProjects = useMemo(
    () =>
      activeCategory === ALL_PROJECTS_CATEGORY
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory, projects],
  );

  const items: Project[] = filteredProjects.slice(0, limit);

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <p className="text-muted-foreground text-sm">{loadingText}</p>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="container mx-auto px-6 py-16">
        <p className="text-muted-foreground text-sm">{noContentText}</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-16" aria-labelledby="projects-section-heading">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8 gap-6">
        <div>
          <h2
            id="projects-section-heading"
            className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3"
          >
            <Briefcase className="w-8 h-8 text-primary" aria-hidden="true" />
            {headingText}
          </h2>
          <p className="text-muted-foreground">{subtitleText}</p>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-2 text-primary hover:gap-4 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1"
            aria-label={viewAllText}
          >
            {viewAllText} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-8" role="group" aria-label={filterLabel}>
          <button
            type="button"
            onClick={() => setActiveCategory(ALL_PROJECTS_CATEGORY)}
            aria-pressed={activeCategory === ALL_PROJECTS_CATEGORY}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
              activeCategory === ALL_PROJECTS_CATEGORY
                ? 'neu-sm bg-primary text-primary-foreground'
                : 'neu bg-card text-muted-foreground hover:text-foreground hover:-translate-y-0.5'
            }`}
          >
            <span>{allCategoriesText}</span>
            <span className="text-xs opacity-70">{projects.length}</span>
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary ${
                activeCategory === category
                  ? 'neu-sm bg-primary text-primary-foreground'
                  : 'neu bg-card text-muted-foreground hover:text-foreground hover:-translate-y-0.5'
              }`}
            >
              <span aria-hidden="true">{categoryEmoji(category)}</span>
              <span>{categoryLabel(category, language)}</span>
              <span className="text-xs opacity-70">{categoryCounts.get(category) ?? 0}</span>
            </button>
          ))}
        </div>
      )}

      {/* Project cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
        {items.map((project, index) => {
          const isClickable = Boolean(onOpenProject);
          const handleCardClick = () => {
            onOpenProject?.(project);
          };

          const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenProject?.(project);
            }
          };

          return (
            <article
              key={project.id}
              className={`neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up p-6 flex flex-col gap-3 transition-all ${
                isClickable ? 'cursor-pointer hover:border-primary/50 hover:shadow-lg' : ''
              }`}
              style={{ animationDelay: `${index * 80}ms` }}
              aria-labelledby={`project-title-${project.id}`}
              onClick={handleCardClick}
              onKeyDown={handleKeyDown}
              tabIndex={isClickable ? 0 : undefined}
              role={isClickable ? 'button' : undefined}
            >
              {/* Preview */}
              {project.preview && (
                <div className="w-full h-40 rounded-xl overflow-hidden bg-muted mb-1 relative group">
                  {isVideoPreview(project.preview) ? (
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
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  {isClickable && (
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <ExternalLink className="w-4 h-4" />
                      {language === 'ru' ? 'Подробнее' : 'View Details'}
                    </div>
                  )}
                </div>
              )}

              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {project.category && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full glass capitalize w-fit">
                    <span aria-hidden="true">{categoryEmoji(project.category)}</span>
                    {project.category}
                  </span>
                )}
                {project.status && (
                  <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {project.status}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3
                id={`project-title-${project.id}`}
                className="text-xl font-bold text-foreground hover:text-primary transition-colors flex items-center justify-between"
              >
                <span>{project.title}</span>
                {isClickable && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </h3>

              {/* Excerpt */}
              {project.content && (
                <p className="text-muted-foreground line-clamp-2 text-sm flex-1">
                  {project.content
                    .replace(/<!--.*?-->/gs, '')
                    .replace(/[#*`>_~-]/g, '')
                    .trim()
                    .slice(0, 180)}
                </p>
              )}

              {/* Technologies / Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  <Tag className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                  {project.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-md bg-muted text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
