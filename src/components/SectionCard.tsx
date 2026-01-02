import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  gradient?: string;
}

export function SectionCard({ title, description, icon: Icon, onClick, gradient }: SectionCardProps) {
  return (
    <button onClick={onClick} className="group block text-left w-full">
      <div className="neu rounded-3xl p-8 bg-card card-hover h-full relative overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity ${
            gradient || 'bg-primary'
          }`}
        />
        <div className="relative z-10">
          <div className="neu-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-muted group-hover:bg-primary/10 transition-colors">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:gradient-text transition-all">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
          <div className="mt-6 flex items-center gap-2 text-primary font-medium">
            <span>Explore</span>
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </div>
        </div>
      </div>
    </button>
  );
}
