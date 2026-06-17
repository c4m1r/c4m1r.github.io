/**
 * AboutSection — site-shell view for the about me, cv, projects list, and legal pages.
 *
 * Pure presentation: receives state/handlers from BlogSite via props.
 */

import { Folder, Scale, Play, Briefcase, Tag } from 'lucide-react';
import { type Language } from '../../../i18n/translations';
import { loadCvLocale } from '../../../domain/resume/resume.loader';
import { stripMarkdown, markdownToHtml } from '../../../domain/content/markdown';

export interface AboutSectionProps {
  ui: any;
  language: Language;
  
  // State from BlogSite
  aboutMe: { content: string } | null;
  legalNotice: { title: string; content: string; updatedAt?: string } | null;
  projects: any[];
  posts: any[];
  wiki: any[];
  
  // Tab states and setters
  mainAboutTab: 'about' | 'cv' | 'projects' | 'legal';
  setMainAboutTab: (tab: 'about' | 'cv' | 'projects' | 'legal') => void;
  activeCvTab: 'it' | 'education' | 'gamedev' | 'rewards';
  setActiveCvTab: (tab: 'it' | 'education' | 'gamedev' | 'rewards') => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Handlers
  setActiveProject: (project: any) => void;
  setActiveSection: (section: any) => void;
  setGlobalSearchQuery: (query: string) => void;
  
  basePath: string;
}

export function AboutSection({
  ui,
  language,
  aboutMe,
  legalNotice,
  projects,
  posts,
  wiki,
  mainAboutTab,
  setMainAboutTab,
  activeCvTab,
  setActiveCvTab,
  selectedCategory,
  setSelectedCategory,
  setActiveProject,
  setActiveSection,
  setGlobalSearchQuery,
  basePath,
}: AboutSectionProps) {
  
  const cv = loadCvLocale(language);

  const statCards = [
    { 
      label: language === 'ru' ? 'Статей' : language === 'fr' ? 'Articles' : 'Articles', 
      value: posts.length, 
      icon: Play, // using Play as a placeholder/substitute for BookOpen if not imported
      accent: 'bg-aero-sky/30' 
    },
    { 
      label: language === 'ru' ? 'Wiki заметок' : language === 'fr' ? 'Notes Wiki' : 'Wiki Notes', 
      value: wiki.length, 
      icon: Briefcase, 
      accent: 'bg-aero-sun/30' 
    },
    { 
      label: language === 'ru' ? 'Проектов' : language === 'fr' ? 'Projets' : 'Projects', 
      value: projects.length, 
      icon: Folder, 
      accent: 'bg-aero-water/30' 
    },
  ];

  return (
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
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <button
              onClick={() => setMainAboutTab('about')}
              className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                mainAboutTab === 'about' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
              }`}
            >
              About me
            </button>
            <button
              onClick={() => setMainAboutTab('projects')}
              className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                mainAboutTab === 'projects' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
              }`}
            >
              <Folder className="w-4 h-4" />
              {ui.projectsTitle.replace(':', '')}
            </button>
            <span className="text-muted-foreground text-sm">
              {language === 'ru' ? 'CV (Резюме):' : 'CV (Resume):'}
            </span>
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
            <button
              onClick={() => setMainAboutTab('legal')}
              className={`inline-flex items-center gap-2 glass px-3 py-2 rounded-full text-sm ${
                mainAboutTab === 'legal' ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
              }`}
              title={ui.nav.legal}
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>

          {mainAboutTab === 'about' && aboutMe && (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(aboutMe.content) }}
            />
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
                      {item.details?.map((d: string, di: number) => {
                        // Парсим технологии в формате ^category^tech^
                        const parts: (string | JSX.Element)[] = [];
                        let lastIndex = 0;
                        const regex = /\^([^\^]+)\^([^\^]+)\^/g;
                        let match;
                        
                        while ((match = regex.exec(d)) !== null) {
                          // Добавляем текст перед совпадением
                          if (match.index > lastIndex) {
                            parts.push(d.substring(lastIndex, match.index));
                          }
                          
                          const category = match[1];
                          const tech = match[2];
                          
                          // Добавляем кликабельный бейдж с подсказкой категории
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
                              title={`Category: ${category}`}
                            >
                              <span className="text-[10px] opacity-70">{category}</span>
                              <span className="font-medium">{tech}</span>
                            </span>
                          );
                          
                          lastIndex = match.index + match[0].length;
                        }
                        
                        // Добавляем оставшийся текст
                        if (lastIndex < d.length) {
                          parts.push(d.substring(lastIndex));
                        }
                        
                        return <li key={di}>{parts.length > 0 ? parts : d}</li>;
                      })}
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

          {mainAboutTab === 'projects' && (
            <div className="mt-4">
              <h3 className="text-3xl font-bold mb-6 gradient-text">{ui.projectsTitle}</h3>
              
              {projects.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">{ui.loading}</p>
                </div>
              ) : (
                <>
              
              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['All', 'IT', 'Gamedev', 'Design'].map((cat) => {
                  const count = cat === 'All' ? projects.length : projects.filter(p => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm ${
                        selectedCategory === cat ? 'bg-primary/20 text-primary' : 'text-foreground/80 hover:bg-card/60'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Projects Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
                  .map((project, index) => (
                    <article
                      key={project.id}
                      className="neu rounded-3xl overflow-hidden bg-card card-hover fade-in-up cursor-pointer"
                      style={{ animationDelay: `${index * 80}ms` }}
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
                          {project.date && <span>· {project.date}</span>}
                        </div>
                        <h4 className="text-xl font-bold mb-2 text-foreground">{project.title}</h4>
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {stripMarkdown(project.content).slice(0, 150)}...
                        </p>
                        {project.tags && project.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.tags.slice(0, 3).map((tag) => {
                              const tagCount = posts.filter((p) => p.tags?.includes(tag)).length + 
                                               wiki.filter((w) => w.tags?.includes(tag)).length +
                                               projects.filter((pr) => pr.tags?.includes(tag)).length;
                              return (
                                <button
                                  key={tag}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSection('search');
                                    setGlobalSearchQuery(tag);
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-xs font-medium"
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
                    </article>
                  ))}
              </div>
              </>
              )}
            </div>
          )}

          {mainAboutTab === 'legal' && legalNotice && (
            <div className="mt-4">
              <h2 className="text-3xl font-bold mb-6">{legalNotice.title}</h2>
              {legalNotice.updatedAt && (
                <p className="text-sm text-muted-foreground mb-6">
                  Last Updated: {legalNotice.updatedAt}
                </p>
              )}
              <div
                className="prose prose-lg max-w-none text-foreground markdown-body"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(legalNotice.content) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Skills & Technologies Radar Chart */}
      {mainAboutTab === 'cv' && cv && (() => {
        // Собираем статистику по категориям из резюме
        const categoryCounts: Record<string, Record<string, number>> = {};
        
        Object.keys(cv).forEach(section => {
          const sectionData = (cv as Record<string, unknown>)[section];
          if (Array.isArray(sectionData)) {
            sectionData.forEach((item: any) => {
              if (!item.details) return;
              
              item.details.forEach((detail: string) => {
                const matches = detail.match(/\^([^\^]+)\^([^\^]+)\^/g);
                if (matches) {
                  matches.forEach(match => {
                    const parts = match.split('^').filter(Boolean);
                    if (parts.length >= 2) {
                      const [category, tech] = parts;
                      if (!categoryCounts[category]) {
                        categoryCounts[category] = {};
                      }
                      categoryCounts[category][tech] = (categoryCounts[category][tech] || 0) + 1;
                    }
                  });
                }
              });
            });
          }
        });
        
        // Обработка категории Business - добавляем управленческие термины
        Object.keys(categoryCounts).forEach(cat => {
          if (cat.toLowerCase().includes('management') || cat.toLowerCase().includes('leadership')) {
            // Если есть отдельная категория Management/Leadership - переносим в Business
            if (cat !== 'Business') {
              if (!categoryCounts['Business']) {
                categoryCounts['Business'] = {};
              }
              Object.entries(categoryCounts[cat]).forEach(([tech, count]) => {
                categoryCounts['Business'][tech] = (categoryCounts['Business'][tech] || 0) + count;
              });
              delete categoryCounts[cat];
            }
          }
        });
        
        // Подсчитываем общее количество для каждой категории
        const categoryTotals = Object.entries(categoryCounts).map(([category, techs]) => ({
          category,
          total: Object.values(techs).reduce((sum, count) => sum + count, 0),
          techs
        })).sort((a, b) => a.category.localeCompare(b.category)); // Сортировка по алфавиту
        
        if (categoryTotals.length === 0) return null;
        
        const maxValue = Math.max(...categoryTotals.map(c => c.total));
        const numCategories = categoryTotals.length;
        
        // Параметры radar chart
        const centerX = 250;
        const centerY = 250;
        const maxRadius = 180;
        const levels = 5;
        
        // Функция для расчета точек многоугольника
        const getPoint = (index: number, value: number) => {
          const angle = (Math.PI * 2 * index) / numCategories - Math.PI / 2;
          const radius = (value / maxValue) * maxRadius;
          return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        };
        
        // Функция для расчета точек осей (labels)
        const getLabelPoint = (index: number, distance: number) => {
          const angle = (Math.PI * 2 * index) / numCategories - Math.PI / 2;
          return {
            x: centerX + distance * Math.cos(angle),
            y: centerY + distance * Math.sin(angle)
          };
        };
        
        return (
          <div className="relative overflow-hidden glass rounded-3xl p-8 neu-sm fade-in-up mb-6">
            <div className="absolute inset-0 noise-overlay pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 text-center">
                {language === 'en' && 'Skills & Technologies Overview'}
                {language === 'ru' && 'Обзор навыков и технологий'}
                {language === 'fr' && 'Aperçu des compétences et technologies'}
              </h3>
              
              <div className="flex justify-center items-center">
                <div className="relative group">
                  <svg width="550" height="550" viewBox="0 0 500 500" className="max-w-full">
                    {/* Концентрические многоугольники (уровни) */}
                    {Array.from({ length: levels }, (_, i) => {
                      const radius = ((i + 1) / levels) * maxRadius;
                      const value = Math.round((maxValue / levels) * (i + 1));
                      const levelNumber = i + 1;
                      
                      // Определяем, является ли этот уровень "жирным" (уровни 4, 7, 11, 14, 18)
                      const thickLevels = [4, 7, 11, 14, 18];
                      const isThickLevel = thickLevels.includes(levelNumber);
                      
                      // Строим точки многоугольника для этого уровня
                      const polygonPoints = categoryTotals
                        .map((_cat, index) => {
                          const angle = (Math.PI * 2 * index) / numCategories - Math.PI / 2;
                          const x = centerX + radius * Math.cos(angle);
                          const y = centerY + radius * Math.sin(angle);
                          return `${x},${y}`;
                        })
                        .join(' ');
                      
                      return (
                        <g key={i}>
                          {/* Многоугольник уровня */}
                          <polygon
                            points={polygonPoints}
                            fill="none"
                            stroke="hsl(var(--foreground))"
                            strokeWidth={isThickLevel ? "2.5" : "1"}
                            opacity={isThickLevel ? "0.7" : "0.25"}
                          />
                          {/* Подписи уровней для всех линий */}
                          <text
                            x={centerX + 5}
                            y={centerY - radius}
                            className={isThickLevel ? "text-xs fill-foreground font-semibold" : "text-xs fill-muted-foreground"}
                            opacity={isThickLevel ? "0.8" : "0.5"}
                          >
                            {value}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Оси от центра к каждой категории */}
                    {categoryTotals.map((cat, index) => {
                      const point = getLabelPoint(index, maxRadius);
                      return (
                        <line
                          key={`axis-${cat.category}`}
                          x1={centerX}
                          y1={centerY}
                          x2={point.x}
                          y2={point.y}
                          stroke="hsl(var(--foreground))"
                          strokeWidth="1.5"
                          opacity="0.4"
                        />
                      );
                    })}
                    
                    {/* Заливка области данных */}
                    <polygon
                      points={categoryTotals
                        .map((cat, index) => {
                          const point = getPoint(index, cat.total);
                          return `${point.x},${point.y}`;
                        })
                        .join(' ')}
                      fill="hsl(var(--primary))"
                      opacity="0.2"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    
                    {/* Точки данных с интерактивностью */}
                    {categoryTotals.map((cat, index) => {
                      const point = getPoint(index, cat.total);
                      const techList = Object.entries(cat.techs)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([tech, count]) => `${tech}: ${count}`)
                        .join('\n');
                      
                      return (
                        <g key={`point-${cat.category}`}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            fill="hsl(var(--primary))"
                            className="cursor-pointer transition-all hover:scale-125"
                            style={{ transformOrigin: `${point.x}px ${point.y}px` }}
                          >
                            <title>{`${cat.category} (Total: ${cat.total})\n\n${techList}${Object.keys(cat.techs).length > 10 ? `\n\n+${Object.keys(cat.techs).length - 10} more technologies` : ''}`}</title>
                          </circle>
                        </g>
                      );
                    })}
                    
                    {/* Подписи категорий */}
                    {categoryTotals.map((cat, index) => {
                      const labelPoint = getLabelPoint(index, maxRadius + 45);
                      return (
                        <text
                          key={`label-${cat.category}`}
                          x={labelPoint.x}
                          y={labelPoint.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-bold fill-current cursor-pointer hover:fill-primary transition-colors"
                          onClick={() => {
                            // При клике на категорию - показываем первую технологию из нее
                            const topTech = Object.entries(cat.techs).sort((a, b) => b[1] - a[1])[0][0];
                            setActiveSection('search');
                            setGlobalSearchQuery(topTech);
                            window.history.pushState({}, '', `${basePath}search`);
                          }}
                        >
                          {cat.category}
                        </text>
                      );
                    })}
                    
                    {/* Центральная точка */}
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r="5"
                      fill="hsl(var(--muted-foreground))"
                      opacity="0.5"
                    />
                  </svg>
                  
                </div>
              </div>
              
              {/* Легенда */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                {categoryTotals.slice(0, 8).map((cat) => (
                  <div key={cat.category} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{cat.category}</div>
                      <div className="text-xs text-muted-foreground">
                        {cat.total} {language === 'ru' ? 'упоминаний' : 'mentions'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tags Pie Chart */}
      <div className="relative overflow-hidden glass rounded-3xl p-8 neu-sm fade-in-up">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-6 text-center">{ui.tags}</h3>
          
          {(() => {
            // Собираем статистику по тегам
            const tagCounts: Record<string, number> = {};
            posts.forEach(p => p.tags?.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }));
            wiki.forEach(w => w.tags?.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }));
            projects.forEach(pr => pr.tags?.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }));
            
            const sortedTags = Object.entries(tagCounts)
              .sort((a, b) => b[1] - a[1]);
            
            const topTags = sortedTags.slice(0, 27);
            const hasMore = sortedTags.length > 27;
            // Считаем totalCount только для отображаемых тегов (топ-27)
            const totalCount = topTags.reduce((sum, [, count]) => sum + count, 0);
            
            // Генерируем цвета для каждого тега
            const colors = [
              'hsl(200, 90%, 55%)', 'hsl(160, 80%, 52%)', 'hsl(45, 98%, 62%)',
              'hsl(280, 70%, 62%)', 'hsl(340, 75%, 58%)', 'hsl(120, 65%, 50%)',
              'hsl(60, 90%, 55%)', 'hsl(180, 75%, 45%)', 'hsl(300, 80%, 60%)',
              'hsl(30, 85%, 55%)', 'hsl(210, 85%, 60%)', 'hsl(140, 80%, 55%)',
              'hsl(90, 75%, 50%)', 'hsl(240, 85%, 65%)', 'hsl(320, 85%, 60%)',
              'hsl(10, 90%, 55%)', 'hsl(260, 75%, 60%)', 'hsl(170, 80%, 50%)'
            ];
            
            let cumulativePercent = 0;
            
            return (
              <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  <svg viewBox="-1 -1 2 2" className="w-full h-full -rotate-90">
                    {topTags.map(([tag, count], index) => {
                      const percent = count / totalCount;
                      
                      // Расчет координат для круговой диаграммы
                      const startX = Math.cos(2 * Math.PI * cumulativePercent);
                      const startY = Math.sin(2 * Math.PI * cumulativePercent);
                      
                      cumulativePercent += percent;
                      
                      const endX = Math.cos(2 * Math.PI * cumulativePercent);
                      const endY = Math.sin(2 * Math.PI * cumulativePercent);
                      
                      const largeArcFlag = percent > 0.5 ? 1 : 0;
                      
                      const pathData = [
                        `M ${startX} ${startY}`,
                        `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                        'L 0 0'
                      ].join(' ');
                      
                      return (
                        <path
                          key={tag}
                          d={pathData}
                          fill={colors[index % colors.length]}
                          className="transition-all hover:opacity-90 hover:scale-105"
                          style={{ transformOrigin: '0 0' }}
                          onClick={() => {
                            setActiveSection('search');
                            setGlobalSearchQuery(tag);
                            window.history.pushState({}, '', `${basePath}search`);
                          }}
                        >
                          <title>{`${tag}: ${count} items (${Math.round(percent * 100)}%)`}</title>
                        </path>
                      );
                    })}
                    {/* Внутреннее отверстие для пончика (donut chart) */}
                    <circle cx="0" cy="0" r="0.5" fill="hsl(var(--card))" />
                  </svg>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 max-w-xl">
                  {topTags.map(([tag, count], index) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setActiveSection('search');
                        setGlobalSearchQuery(tag);
                        window.history.pushState({}, '', `${basePath}search`);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div 
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tag}</div>
                        <div className="text-xs text-muted-foreground">{count} {count === 1 ? 'item' : 'items'}</div>
                      </div>
                    </button>
                  ))}
                  {hasMore && (
                    <div className="flex items-center gap-2 p-2 text-muted-foreground">
                      <div className="w-4 h-4 rounded bg-muted flex-shrink-0" />
                      <div className="text-sm">... and {sortedTags.length - 27} more</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
