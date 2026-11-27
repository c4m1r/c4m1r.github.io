import { createPortal } from 'react-dom';
import { classicEditText } from '../../../i18n/classicEditStrings';

export interface VistaTaskbarPreviewProps {
  /** Window title shown in the preview's head. */
  title: string;
  /** Window icon (the same image the task button shows). */
  icon?: string;
  /** Centre x and top y of the task button, in viewport pixels. */
  anchorX: number;
  anchorY: number;
  language: string;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Vista live taskbar preview. Windows Vista shows a live thumbnail of the window above its task button;
 * this shell has no compositor, so the thumbnail is a schematic: the window's icon on a white face, framed in glass.
 * It is portalled to the body so the taskbar's overflow clipping cannot cut it.
 */
export function VistaTaskbarPreview({
  title,
  icon,
  anchorX,
  anchorY,
  language,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: VistaTaskbarPreviewProps) {
  return createPortal(
    <div
      className="vista-taskbar-preview"
      style={{ left: anchorX, top: anchorY - 8 }}
      role="tooltip"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="vista-taskbar-preview__head">
        {icon ? <img src={icon} alt="" /> : null}
        <span className="vista-taskbar-preview__title">{title}</span>
        <button
          type="button"
          className="vista-taskbar-preview__close"
          aria-label={classicEditText(language, 'close')}
          title={classicEditText(language, 'close')}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="vista-taskbar-preview__body">
        {icon ? <img className="vista-taskbar-preview__glyph" src={icon} alt="" /> : null}
      </div>
    </div>,
    document.body,
  );
}
