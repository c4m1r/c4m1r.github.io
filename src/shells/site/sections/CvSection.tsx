import { type Dispatch, type SetStateAction, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import { type CvEntry, type CvLocale, type CvTabId } from '../../../domain/resume/resume.types';
import { routes } from '../siteRoutes';

interface CvPrototype {
  title?: string;
  description?: string;
  tech?: string[];
}

type CvDataWithPrototypes = CvLocale & {
  prototypes?: CvPrototype[];
};

interface CvSectionProps {
  cv: CvDataWithPrototypes;
  activeCvTab: CvTabId;
  setActiveCvTab: Dispatch<SetStateAction<CvTabId>>;
  setActiveSection: (section: 'search') => void;
  setGlobalSearchQuery: (query: string) => void;
  ui: {
    cvTitle: string;
  };
}

const CV_TABS: CvTabId[] = ['it', 'education', 'gamedev', 'rewards'];
const TECH_MARKER_PATTERN = /\^([^^]+)\^([^^]+)\^/g;

function renderDetailWithTechMarkers(
  detail: string,
  detailIndex: number,
  openSearchForTech: (tech: string) => void,
): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TECH_MARKER_PATTERN.exec(detail)) !== null) {
    if (match.index > lastIndex) {
      parts.push(detail.substring(lastIndex, match.index));
    }

    const category = match[1];
    const tech = match[2];
    parts.push(
      <span
        key={`${detailIndex}-${match.index}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors mx-0.5"
        onClick={(event) => {
          event.stopPropagation();
          openSearchForTech(tech);
        }}
      >
        <span className="text-[10px] opacity-70">{category}</span>
        <span className="font-medium">{tech}</span>
      </span>,
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < detail.length) {
    parts.push(detail.substring(lastIndex));
  }

  return parts.length > 0 ? parts : detail;
}

export function CvSection({
  cv,
  activeCvTab,
  setActiveCvTab,
  setActiveSection,
  setGlobalSearchQuery,
  ui,
}: CvSectionProps) {
  const entries: CvEntry[] = cv[activeCvTab] || [];
  const prototypes = cv.prototypes || [];

  const openSearchForTech = (tech: string) => {
    setActiveSection('search');
    setGlobalSearchQuery(tech);
    window.history.pushState({}, '', routes.search(tech));
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(cv, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cv.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <h2 className="text-3xl font-bold">{ui.cvTitle}</h2>
      <div className="flex flex-wrap gap-3 items-center">
        {CV_TABS.map((tab) => (
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
            onClick={downloadJson}
            className="neu px-4 py-2 rounded-xl bg-primary text-primary-foreground flex items-center gap-2"
          >
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 neu-sm fade-in-up">
        <h3 className="text-2xl font-semibold mb-4 capitalize">{activeCvTab}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {entries.map((item, index) => (
            <div key={`${item.title}-${index}`} className="bg-card rounded-2xl p-4 border border-border card-hover">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">{item.title}</span>
                {item.year && <span>{item.year}</span>}
                {item.subtitle && <span>• {item.subtitle}</span>}
              </div>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {item.details?.map((detail, detailIndex) => (
                  <li key={detailIndex}>{renderDetailWithTechMarkers(detail, detailIndex, openSearchForTech)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {activeCvTab === 'gamedev' && prototypes.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold mb-6">Game Prototypes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {prototypes.map((proto, index) => (
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
                    {(proto.tech || []).map((tech) => (
                      <span key={tech} className="px-2 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground">
                        {tech}
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
  );
}
