/**
 * ProjectsSection — site-shell widget for the home page.
 *
 * Reads projects from domain via useProjects() hook.
 * Displays up to `limit` latest items grouped by category.
 * Language-aware. No OS wrapper classes — this is the site-shell view.
 */

import { Briefcase, ArrowRight, Tag } from 'lucide-react';
import { useProjects } from '../../../domain/projects/useProjects';
import { useApp } from '../../../contexts/AppContext';
import { type Project } from '../../../domain/projects/projects.types';

interface ProjectsSectionProps {
  /** Max items to show. Default 6. */
  limit?: number;
  /** Called when user clicks "View All". Optional. */
  onViewAll?: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  IT: '💻',
  Gamedev: '🎮',
  Design: '🎨',
  Web: '🌐',
  Mobile: '📱',
  Other: '📁',
};

function categoryEmoji(cat?: string): string {
  if (!cat) return '📁';
  return CATEGORY_EMOJI[cat] ?? CATEGORY_EMOJI[cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()] ?? '📁';
}

export function ProjectsSection({ limit = 6, onViewAll }: ProjectsSectionProps) {
  const { projects, loading } = useProjects();
  const { language } = useApp();

  const headingText = language === 'ru' ? 'Проекты' : 'Projects';
  const subtitleText =
    language === 'ru'
      ? 'Избранные работы и эксперименты'
      : 'Selected works and experiments';
  const viewAllText = language === 'ru' ? 'Все проекты' : 'View all';
  const loadingText = language === 'ru' ? 'Загрузка...' : 'Loading…';
  const noContentText =
    language === 'ru'
      ? 'Проекты появятся здесь'
      : 'Projects will appear here';

  const items: Project[] = projects.slice(0, limit);

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <p className="text-muted-foreground text-sm">{loadingText}</p>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="container mx-auto px-6 py-16">
        <p className="text-muted-foreground text-sm">{noContentText}</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-6 py-16" aria-labelledby="projects-section-heading">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10">
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
            className="flex items-center gap-2 text-primary hover:gap-4 transition-all font-medium"
            aria-label={viewAllText}
          >
            {viewAllText} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Project cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((project, index) => (
          <article
            key={project.id}
            className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up p-6 flex flex-col gap-3"
            style={{ animationDelay: `${index * 80}ms` }}
            aria-labelledby={`project-title-${project.id}`}
          >
            {/* Preview */}
            {project.preview && (
              <div className="w-full h-36 rounded-xl overflow-hidden bg-muted mb-1">
                <img
                  src={project.preview}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Category badge */}
            {project.category && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full glass capitalize w-fit">
                <span aria-hidden="true">{categoryEmoji(project.category)}</span>
                {project.category}
              </span>
            )}

            {/* Title */}
            <h3
              id={`project-title-${project.id}`}
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              {project.title}
            </h3>

            {/* Excerpt */}
            {project.content && (
              <p className="text-muted-foreground line-clamp-2 text-sm flex-1">
                {project.content
                  .replace(/<!--.*?-->/gs, '')
                  .replace(/[#*`>_~\-]/g, '')
                  .trim()
                  .slice(0, 180)}
              </p>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                <Tag className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                {project.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-1 text-xs rounded-lg bg-muted text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
