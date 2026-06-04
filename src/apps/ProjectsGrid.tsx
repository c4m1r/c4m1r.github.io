/**
 * ProjectsGrid — desktop app component.
 * Migrated to domain layer: uses useProjects() instead of virtual FileSystem.
 * OS visual skin is applied via .os-{theme} CSS wrappers — no WinXpProjectsGrid, etc.
 */

import { useMemo, useState } from 'react';
import { useProjects } from '../domain/projects/useProjects';
import { type Project } from '../domain/projects/projects.types';

interface ProjectsByCategory {
  category: string;
  projects: Project[];
}

export function ProjectsGrid() {
  const { projects, loading, byCategory } = useProjects();
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const categories: ProjectsByCategory[] = useMemo(() => {
    const result: ProjectsByCategory[] = [];
    for (const [cat, items] of byCategory) {
      result.push({ category: cat, projects: items });
    }
    // Projects without a category fall under 'Other'
    const uncategorised = projects.filter((p) => !p.category);
    if (uncategorised.length > 0) {
      result.push({ category: 'Other', projects: uncategorised });
    }
    return result;
  }, [byCategory, projects]);

  const focused = useMemo(
    () => projects.find((p) => p.id === focusedId) ?? null,
    [projects, focusedId],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2463c5] text-white text-sm">
        Loading projects…
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#2463c5] text-white text-sm">
        No projects found. Add markdown files to{' '}
        <code className="ml-1">content/about/projects/</code>.
      </div>
    );
  }

  return (
    <div className="projects-app w-full h-full flex flex-col lg:flex-row font-tahoma text-white bg-[#2463c5]">
      {/* Left: category / project list */}
      <div className="projects-app__list flex-1 overflow-auto px-5 py-6">
        {categories.map(({ category, projects: catProjects }) => (
          <div key={category} className="projects-app__category relative mb-6">
            <h2 className="projects-app__category-name text-xs font-semibold px-3 uppercase tracking-wide">
              {category}
            </h2>
            <div className="absolute left-[-12px] top-5 w-64 h-px bg-gradient-to-r from-[#8fc5ff] to-transparent opacity-80" />
            <div className="flex flex-wrap gap-3 pt-3 pb-1">
              {catProjects.map((project) => {
                const isFocused = project.id === focusedId;
                return (
                  <button
                    key={project.id}
                    className={`projects-app__card flex items-center gap-2.5 px-4 pb-2 pt-2 rounded-sm transition-all duration-150 cursor-pointer border border-transparent ${
                      isFocused
                        ? 'bg-[#0B61FF] border-white/50 shadow-[0_4px_12px_rgba(0,0,0,0.35)]'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setFocusedId(project.id)}
                  >
                    {project.preview ? (
                      <img
                        src={project.preview}
                        alt={project.title}
                        className="w-10 h-10 object-contain"
                        style={{ opacity: isFocused ? 0.6 : 1 }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-white/20 flex items-center justify-center text-xl">
                        📁
                      </div>
                    )}
                    <p
                      className="projects-app__card-label text-xs font-semibold text-left"
                      style={{ color: isFocused ? '#ffffff' : '#e4ecff' }}
                    >
                      {project.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Right: detail panel */}
      <div className="projects-app__detail w-full lg:w-[38%] min-h-[280px] lg:h-full bg-gradient-to-b from-[#f9fafc] to-[#d7dff5] text-[#0f1d4f] border-l border-[#8aa3e5] px-5 py-6 shadow-[inset_4px_0_10px_rgba(0,0,0,0.05)]">
        {focused ? (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-[#6174b4]">Project</p>
              <h3 className="text-lg font-bold text-[#0b2e82]">{focused.title}</h3>
              {focused.category && (
                <p className="text-xs text-[#6174b4] mt-1">{focused.category}</p>
              )}
              {focused.tags && focused.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {focused.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-[#316ac5]/20 text-[#0b2e82]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto bg-white/80 border border-[#cfd7f0] rounded-lg p-4 text-[13px] leading-relaxed text-[#1c275f] shadow-[0_6px_20px_rgba(0,0,0,0.1)] whitespace-pre-line">
              {focused.content?.slice(0, 1500) ||
                'No description. Add content to the project markdown file.'}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 text-[#1c275f]/80">
            <p className="text-xs uppercase tracking-wide mb-2">Select a project</p>
            <p className="text-sm leading-relaxed">
              Click a project card on the left to view its details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
