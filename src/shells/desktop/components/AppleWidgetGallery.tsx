import { type AppleWidgetVisibility } from './AppleDesktopWidgets';

interface AppleWidgetGalleryProps {
  open: boolean;
  visibility: AppleWidgetVisibility;
  onClose: () => void;
  onToggle: (key: keyof AppleWidgetVisibility) => void;
}

const widgets: Array<{
  key: keyof AppleWidgetVisibility;
  title: string;
  description: string;
  glyph: string;
}> = [
  { key: 'clock', title: 'Clock', description: 'Current time and date', glyph: 'C' },
  { key: 'calendar', title: 'Calendar', description: 'Current month', glyph: '17' },
  { key: 'battery', title: 'Battery', description: 'Device battery status', glyph: 'B' },
];

export function AppleWidgetGallery({
  open,
  visibility,
  onClose,
  onToggle,
}: AppleWidgetGalleryProps) {
  if (!open) return null;

  return (
    <div className="apple-widget-gallery" role="dialog" aria-label="Edit Widgets">
      <button
        type="button"
        className="apple-widget-gallery__backdrop"
        aria-label="Close Edit Widgets"
        onClick={onClose}
      />

      <section className="apple-widget-gallery__panel" onClick={(event) => event.stopPropagation()}>
        <header>
          <div>
            <strong>Edit Widgets</strong>
            <small>NervaWEB WebOS</small>
          </div>
          <button type="button" onClick={onClose}>Done</button>
        </header>

        <div className="apple-widget-gallery__list">
          {widgets.map((widget) => (
            <button
              type="button"
              key={widget.key}
              className={visibility[widget.key] ? 'is-enabled' : ''}
              onClick={() => onToggle(widget.key)}
              aria-pressed={visibility[widget.key]}
            >
              <span className="apple-widget-gallery__glyph">{widget.glyph}</span>
              <span>
                <strong>{widget.title}</strong>
                <small>{widget.description}</small>
              </span>
              <i>{visibility[widget.key] ? 'On' : 'Off'}</i>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
