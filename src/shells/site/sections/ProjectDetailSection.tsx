import { ArrowLeft, ArrowRight, Briefcase, Calendar, Tag } from 'lucide-react';
import { type ContentItem } from '../../../domain/content/types';
import { markdownToHtml } from '../../../domain/content/markdown';
import { type Section } from '../siteTypes';
import { routes } from '../siteRoutes';

interface ProjectDetailSectionProps {
  ui: { back: string; projectsTitle: string; tags: string };
  language: string;
  activeProject: ContentItem;
  tagCounts: Record<string, number>;
  setActiveProject: (project: ContentItem | null) => void;
  setActiveSection: (section: Section) => void;
  setMainAboutTab: (tab: 'about' | 'cv' | 'projects' | 'legal') => void;
  setGlobalSearchQuery: (query: string) => void;
}

export function ProjectDetailSection({
  ui,
  language,
  activeProject,
  tagCounts,
  setActiveProject,
  setActiveSection,
  setMainAboutTab,
  setGlobalSearchQuery,
}: ProjectDetailSectionProps) {
  return (
    <main className="pt-32 pb-24" key={`project-${activeProject.id}-${language}`}>
      <div className="container mx-auto px-6">
        <section className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-6 md:p-10 neu-sm animate-fade-in">
            <button
              onClick={() => {
                setActiveProject(null);
                setActiveSection('about');
                setMainAboutTab('projects');
                window.history.pushState({}, '', routes.about());
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
                {activeProject.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveProject(null);
                      setActiveSection('search');
                      setGlobalSearchQuery(tag);
                      window.history.pushState({}, '', routes.search(tag));
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <span className="text-xs opacity-70">({tagCounts[tag] || 0})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
