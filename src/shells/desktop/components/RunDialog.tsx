import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../../contexts/useApp';
import runIconXp from '../../../themes/winxp/assets/icons/run.png';

export interface RunDialogProps {
  onClose: () => void;
  onRun: (command: string) => void;
}

export function RunDialog({ onClose, onRun }: RunDialogProps) {
  const { theme, language } = useApp();
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isWindowsXp = theme === 'win-xp';
  const isXpFamily = theme !== 'win-98';
  const isRu = language === 'ru';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onRun(command.trim());
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const labels = {
    title: isRu ? 'Выполнить' : 'Run',
    description: isRu
      ? 'Введите имя программы, папки, документа или ресурса Интернета, и Windows откроет их.'
      : 'Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.',
    open: isRu ? 'Открыть:' : 'Open:',
    cancel: isRu ? 'Отмена' : 'Cancel',
    browse: isRu ? 'Обзор...' : 'Browse...',
    close: isRu ? 'Закрыть' : 'Close',
  };

  if (isWindowsXp) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center"
        style={{ backgroundColor: 'transparent' }}
        onClick={onClose}
      >
        <div
          className="os-window w-[411px] overflow-hidden rounded-t-[8px] bg-[#0831d9] p-[3px] pt-0 font-tahoma text-[11px] shadow-[2px_3px_8px_rgba(0,0,0,0.45)]"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="xp-run-dialog-title"
        >
          <div className="os-titlebar flex h-[30px] items-center justify-between px-[5px] text-white">
            <div className="flex min-w-0 items-center gap-1.5">
              <span id="xp-run-dialog-title" className="os-titlebar-title truncate text-[13px] font-bold [text-shadow:1px_1px_1px_#0f2f76]">
                {labels.title}
              </span>
            </div>
            <div className="xp-titlebar__controls flex items-center">
              <button
                type="button"
                onClick={onClose}
                className="xp-titlebar__button xp-titlebar__button--close border-0 bg-transparent p-0"
                aria-label={labels.close}
                title={labels.close}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="os-window-body bg-[#ece9d8] px-[11px] pb-[10px] pt-[13px] text-black">
            <div className="flex items-start gap-[12px]">
              <img
                src={runIconXp}
                alt=""
                aria-hidden="true"
                className="mt-[1px] h-8 w-8 shrink-0 object-contain"
              />
              <p className="m-0 max-w-[330px] leading-[15px]">
                {labels.description}
              </p>
            </div>

            <div className="mt-[16px] flex items-center gap-[8px]">
              <label htmlFor="xp-run-command" className="w-[45px] shrink-0 text-right">
                {labels.open}
              </label>
              <input
                id="xp-run-command"
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="os-input h-[21px] flex-1 border border-[#7f9db9] bg-white px-[3px] py-0 font-tahoma text-[11px] text-black outline-none shadow-[inset_1px_1px_1px_rgba(0,0,0,0.12)] focus:border-[#316ac5]"
                autoComplete="off"
              />
            </div>

            <div className="mt-[14px] flex justify-end gap-[7px]">
              <button
                type="submit"
                className="os-button h-[23px] min-w-[75px] rounded-[3px] border border-[#003c74] bg-[#ece9d8] px-[10px] font-tahoma text-[11px] text-black shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899] hover:bg-[#f5f3e8] active:shadow-[inset_1px_1px_1px_#777]"
              >
                OK
              </button>
              <button
                type="button"
                onClick={onClose}
                className="os-button h-[23px] min-w-[75px] rounded-[3px] border border-[#003c74] bg-[#ece9d8] px-[10px] font-tahoma text-[11px] text-black shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899] hover:bg-[#f5f3e8] active:shadow-[inset_1px_1px_1px_#777]"
              >
                {labels.cancel}
              </button>
              <button
                type="button"
                className="os-button h-[23px] min-w-[75px] cursor-not-allowed rounded-[3px] border border-[#aca899] bg-[#ece9d8] px-[10px] font-tahoma text-[11px] text-[#808080] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899]"
                disabled
                title={labels.browse}
              >
                {labels.browse}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[99999]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className={`${
          isXpFamily
            ? 'bg-[#ece9d8] border-t-2 border-l-2 border-[#ffffff] border-r-2 border-b-2 border-r-[#5a5a5a] border-b-[#5a5a5a] shadow-2xl'
            : 'bg-[#c0c0c0] border-2 border-white border-b-black border-r-black shadow-lg'
        } w-[420px] os-window`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div
          className={`${
            isXpFamily
              ? 'bg-gradient-to-r from-[#0054e3] to-[#0a5fef] text-white'
              : 'bg-gradient-to-r from-[#000080] to-[#1084d0] text-white'
          } px-2 py-1 flex items-center justify-between cursor-move os-titlebar`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold os-titlebar-title">Run</span>
          </div>
          <div className="os-titlebar-controls">
            <button
              onClick={onClose}
              className={`${
                isXpFamily
                  ? 'w-4 h-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold'
                  : 'w-4 h-4 bg-[#c0c0c0] border border-white border-b-black border-r-black text-black text-xs font-bold'
              } flex items-center justify-center os-button`}
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 os-window-body">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-4xl">🏃</div>
            <div className="flex-1">
              <p className="text-sm mb-4">
                Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
              </p>
              <div className="mb-2">
                <label className="text-xs font-semibold block mb-1">Open:</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className={`w-full ${
                    isXpFamily
                      ? 'border border-[#7f9db9] px-2 py-1'
                      : 'border-2 border-[#808080] border-t-black border-l-black px-1 py-0.5'
                  } outline-none text-sm os-input`}
                  placeholder="notepad"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className={`px-6 py-1.5 text-sm os-button ${
                isXpFamily
                  ? 'bg-[#ece9d8] border border-[#003c74] hover:bg-[#d8d5c8] active:border-black'
                  : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] active:border-black active:border-b-white active:border-r-white'
              }`}
            >
              OK
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-1.5 text-sm os-button ${
                isXpFamily
                  ? 'bg-[#ece9d8] border border-[#aca899] hover:bg-[#d8d5c8]'
                  : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] active:border-black active:border-b-white active:border-r-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-6 py-1.5 text-sm os-button ${
                isXpFamily
                  ? 'bg-[#ece9d8] border border-[#aca899] opacity-50 cursor-not-allowed'
                  : 'bg-[#c0c0c0] border-2 border-white border-b-[#808080] border-r-[#808080] opacity-50 cursor-not-allowed'
              }`}
              disabled
            >
              Browse...
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
