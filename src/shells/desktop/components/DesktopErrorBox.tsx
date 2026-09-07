import { useEffect } from 'react';
import { useApp } from '../../../contexts/useApp';
import errorSoundSrc from '../../../themes/winxp/assets/sounds/error.wav';
import legacyErrorIcon from '../../../themes/winxp/assets/icons/897(32x32).png';
import xpErrorIcon from '../../../themes/winxp/assets/dialog/error.png';

export interface DesktopErrorBoxProps {
  onClose: () => void;
  message?: string;
}

function lineBreak(str: string, className: string) {
  return str.split('\n').map((line, index) => (
    <p key={index} className={className}>
      {line}
    </p>
  ));
}

export function DesktopErrorBox({ onClose, message = "Something's wrong!" }: DesktopErrorBoxProps) {
  const { theme } = useApp();
  const isWindowsXp = theme === 'win-xp';

  useEffect(() => {
    try {
      const audio = new Audio(errorSoundSrc);
      audio.play().catch((e) => {
        console.log('Error playing sound:', e);
      });
    } catch (e) {
      console.log('Error initializing audio:', e);
    }
  }, []);

  if (isWindowsXp) {
    return (
      <div className="flex h-full w-full flex-col bg-[#ece9d8] px-[12px] pb-[11px] pt-[15px] font-tahoma text-[11px] text-black os-panel">
        <div className="flex min-h-[55px] flex-1 items-start">
          <img
            src={xpErrorIcon}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 shrink-0 object-contain"
          />
          <div className="px-[15px] pb-[10px] pt-[2px] leading-[16px]">
            {lineBreak(message, 'm-0 min-h-[16px] leading-[16px] text-black')}
          </div>
        </div>

        <div className="flex w-full justify-center pt-[4px]">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="os-button h-[23px] min-w-[75px] rounded-[3px] border border-[#003c74] bg-[#ece9d8] px-[10px] font-tahoma text-[11px] text-black shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899] outline-none hover:bg-[#f5f3e8] focus:shadow-[inset_0_0_0_1px_#fff,0_0_0_1px_#000] active:shadow-[inset_1px_1px_1px_#777]"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] w-full h-full text-[11px] p-3 flex flex-col os-panel">
      <div className="flex flex-1">
        <img src={legacyErrorIcon} alt="error" className="w-[30px] h-[30px] flex-shrink-0" />
        <div className="px-5 pb-3 pt-0.5">
          {lineBreak(message, 'text-gray-800 leading-4 mb-1')}
        </div>
      </div>
      <div className="flex w-full justify-center">
        <div
          onClick={onClose}
          className="w-20 h-[22px] flex border border-black justify-center items-center cursor-pointer os-button"
          style={{
            boxShadow: 'inset -1px -1px 1px black'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.boxShadow = 'inset 1px 1px 1px black';
            const span = e.currentTarget.querySelector('span');
            if (span) {
              span.style.transform = 'translate(1px, 1px)';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.boxShadow = 'inset -1px -1px 1px black';
            const span = e.currentTarget.querySelector('span');
            if (span) {
              span.style.transform = 'translate(0, 0)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'inset -1px -1px 1px black';
            const span = e.currentTarget.querySelector('span');
            if (span) {
              span.style.transform = 'translate(0, 0)';
            }
          }}
        >
          <span className="leading-[11px]">OK</span>
        </div>
      </div>
    </div>
  );
}
