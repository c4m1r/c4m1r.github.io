import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../contexts/useApp';
import { loadAllProjects } from './projects.loader';
import { type Project } from './projects.types';

export interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  /** Projects grouped by lower-cased tag */
  byTag: Map<string, Project[]>;
  /** Projects grouped by lower-cased category */
  byCategory: Map<string, Project[]>;
}

/**
 * Hook to retrieve projects, language-reactive via AppContext.
 */
export function useProjects(): UseProjectsResult {
  const { language } = useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    loadAllProjects(language)
      .then((items) => {
        if (!active) return;
        setProjects(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useProjects] Failed to load projects:', err);
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [language]);

  const byTag = useMemo<Map<string, Project[]>>(() => {
    const map = new Map<string, Project[]>();
    for (const p of projects) {
      for (const tag of p.tags ?? []) {
        const key = tag.toLowerCase();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(p);
      }
    }
    return map;
  }, [projects]);

  const byCategory = useMemo<Map<string, Project[]>>(() => {
    const map = new Map<string, Project[]>();
    for (const p of projects) {
      if (!p.category) continue;
      const key = p.category.toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [projects]);

  return { projects, loading, byTag, byCategory };
}
